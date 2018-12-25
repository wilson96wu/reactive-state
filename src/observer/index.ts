import { def, isObject, isPlainObject, prototypeAugment } from '../util';
import { arrayMethods } from './array';
import Dependency from './dependency';

/**
 * Define a reactive property on an object
 *
 * @method defineReactive
 * @param obj object to define the property on
 * @param key key of property
 * @param value value of property
 */
export function defineReactive(obj: any, key: string, value?: any): void {
  const property: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return;
  }

  const dependency = new Dependency();

  // cater for pre-defined getter/setters
  // tslint:disable-next-line:ban-types
  const getter: Function | undefined = property && property.get;
  // tslint:disable-next-line:ban-types
  const setter: Function | undefined = property && property.set;
  if ((!getter || setter) && arguments.length === 2) {
    value = obj[key];
  }

  let childObj: Observer | undefined = observe(value);
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get: function reactiveGetter(): any {
      const val: any = getter ? getter.call(obj) : value;
      if (Dependency.target) {
        dependency.depend();
        if (childObj) {
          childObj.dependency.depend();
          if (Array.isArray(val)) {
            dependArray(val);
          }
        }
      }
      return val;
    },
    set: function reactiveSetter(newVal: any): void {
      const val: any = getter ? getter.call(obj) : value;

      if (newVal === val || (newVal !== newVal && val !== val)) {
        return;
      }

      // #7981: for accessor properties without setter
      if (getter && !setter) { return; }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        value = newVal;
      }
      childObj = observe(newVal);
      dependency.notify();
    },
  });
}

/**
 * Collect dependencies on array elements when the array is touched,
 * since we cannot intercept array element access like property getters
 *
 * @method dependArray
 * @param value array to depend for
 */
function dependArray(value: any[]): void {
  for (let e: any , i: number = 0, l: number = value.length; i < l; i++) {
    e = value[i];
    if (e && e.__ob__) {
      e.__ob__.dependency.depend();
    }
    if (Array.isArray(e)) {
      dependArray(e);
    }
  }
}

/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 *
 * @class Observer
 * @constructor
 */
export class Observer {
  public value: any;
  public dependency: Dependency;

  constructor(value: any) {
    this.value = value;
    this.dependency = new Dependency();
    def(value, '__ob__', this);
    if (Array.isArray(value)) {
      prototypeAugment(value, arrayMethods);
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }

  /**
   * Walk through each property and convert them into
   * getter/setters. This method should only be called when
   * value type is Object
   *
   * @method Observer.walk
   * @param obj object to iterate over
   */
  public walk(obj: object) {
    const keys: string[] = Object.keys(obj);
    for (const key of keys) {
      defineReactive(obj, key);
    }
  }

  /**
   * Observe a list of Array items
   *
   * @method Observer.observeArray
   * @param items items in array that need to be observed
   */
  public observeArray(items: any[]) {
    for (const item of items) {
      observe(item);
    }
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
export function observe(value: any): Observer | undefined {
  if (!isObject(value)) {
    return;
  }

  let ob: Observer | undefined;
  if (value.hasOwnProperty('__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value)
  ) {
    ob = new Observer(value);
  }
  return ob;
}
