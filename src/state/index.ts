import { observe } from '../observer';
import Watcher from '../observer/watcher';

// TODO: ADD CHECK FOR isPlainObject

/**
 * State is an instance of reactive state.
 * You can use this as a starting point for creating reactive libraries.
 *
 * @class State
 * @constructor
 */
export default class State {
  public options: any;
  private computedWatchersMap: any = {};
  private watchers: Watcher[] = [];

  constructor(options: any) {
    if (options && typeof options === 'object') {
      this.options = options;
      this.defineReactiveProperties(JSON.parse(JSON.stringify(options.data)));
      this.defineComputedProperties(options.computed);
      this.defineWatchers(options.watcher);
    }
  }

  /**
   * Define a new watched piece of state.
   *
   * @method State.watch
   * @param expression expression that specifies the path to the piece of state you want to watch
   * @param callback callback function to be called when the expression's value changes
   */
  // tslint:disable-next-line:ban-types
  public watch(expression: string, callback: Function) {
    this.defineWatchers({
      [expression]: callback,
    });
  }

  /**
   * Defines reactive data properties from the provided object.
   *
   * @method State.defineReactiveProperties
   * @param data object containing properties to make reactive
   */
  private defineReactiveProperties(data: any) {
    if (data && typeof data === 'object') {
      let state: any = observe(data);

      if (state) {
        state = state.value;

        // copy observer properties to the state instance
        let propertyDescriptor: PropertyDescriptor | undefined;
        for (const property in state) {
          if (state.hasOwnProperty(property)) {
            propertyDescriptor = Object.getOwnPropertyDescriptor(state, property);
            if (propertyDescriptor) {
              Object.defineProperty(this, property, propertyDescriptor);
            }            
          }
        }
      }
    }
  }

  /**
   * Defines computed properties using the functions provided.
   * They are only recalculated when their dependencies change which makes them very efficient.
   *
   * @method State.defineComputedProperties
   * @param computed object containing a list of function definitions which create computed properties
   */
  private defineComputedProperties(computed: any) {
    if (computed && typeof computed === 'object') {
      for (const property in computed) {
        if (computed.hasOwnProperty(property) && typeof computed[property] === 'function') {          
          if (!this.hasOwnProperty(property)) {
            const watcher = new Watcher(computed[property].bind(this), undefined, true);

            Object.defineProperty(this, property, {
              configurable: true,
              enumerable: true,
              get: function computedProperty() {
                return watcher.value;
              },
            });

            this.computedWatchersMap[property] = watcher;
          } else {
            throw new Error(`${property} registered as computed property is already defined as a data property`);
          }
        }
      }
    }
  }

  /**
   * Define watchers which watches a piece of state and calls a callback when that state changes.
   *
   * @method State.defineWatchers
   * @param watchers object containing a function list, the object keys should be the same as the piece of state you are watching.
   */
  private defineWatchers(watchers: any) {
    if (watchers && typeof watchers === 'object') {
      for (const propertyKey in watchers) {
        if (watchers.hasOwnProperty(propertyKey) && typeof watchers[propertyKey] === 'function') {
          const propertyDescriptor: PropertyDescriptor | undefined = this.getPropertyDescriptor(this, propertyKey);
          if (propertyDescriptor && propertyDescriptor.get) {
            // if you are watching computed properties use their watchers instead of creating another watcher            
            // @ts-ignore
            if (propertyDescriptor.get.name === 'computedProperty' && this.computedWatchersMap.hasOwnProperty(propertyKey)) {
              this.computedWatchersMap[propertyKey].addCallback(watchers[propertyKey].bind(this));
              this.watchers.push(this.computedWatchersMap[propertyKey]);
            }
            else {
              this.watchers.push(new Watcher(propertyDescriptor.get, [watchers[propertyKey].bind(this)]));
            }
          }
          else {
            throw new Error(`Cannot watch the property ${propertyKey} as it does not exist on the state instance`);
          }
        }
      }
    }
  }

  /**
   * Finds the property descriptor from an object using the provided expression(key).
   *
   * @method State.getOwnPropertyDescriptor
   * @param source source object to search
   * @param key simple dot accessor key that drills into the provided object to find the last property in the key
   */
  private getPropertyDescriptor(source: any, key: any): PropertyDescriptor | undefined {
    const keys: string[] = key.split('.');
    let value: any;
    let propertyDescriptor: PropertyDescriptor | undefined;

    do {
      value = source[keys[0]];
      propertyDescriptor = Object.getOwnPropertyDescriptor(source, keys[0]);
      keys.shift();
      source = value;
    }
    while (value && source[keys[0]]);

    return propertyDescriptor;
  }
}