/**
 * Define a property
 *
 * @method def
 * @param obj source to add the property to
 * @param key key of property to add
 * @param val value of property
 * @param enumerable whether or not the property in enumerable
 */
export function def(obj: object, key: string, val: any, enumerable?: boolean): void {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: !!enumerable,
    value: val,
    writable: true,
  });
}

/**
 * Checks if a value is an object
 *
 * @method isObject
 * @param obj parameter to check
 */

export function isObject(obj: any): boolean {
  return (obj && typeof obj === 'object') ? true : false;
}

/**
 * Add a object's functionality to your target object's prototype chain
 *
 * @method prototypeAugment
 * @param target target object to augment
 * @param src src to use for augmentation
 */
export function prototypeAugment(target: any, src: object): void {
  if (typeof target === 'object') {
    target.__proto__ = src;
  }
}

/**
 * Strict object type check. Only returns true for plain JavaScript objects
 *
 * @method isPlainObject
 * @param obj object to check
 */
export function isPlainObject(obj: any): boolean {
  return (obj && obj.constructor && obj.constructor.name === 'Object') ? true : false;
}
