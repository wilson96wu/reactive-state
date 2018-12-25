/**
 * Provides the functionality to create reactive arrays by wrapping array prototype methods
 *
 * @module array
 */

import { def } from '../util/object';

const arrayProto: any = Array.prototype;
export const arrayMethods: any = Object.create(arrayProto);

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
];

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach((method) => {
  // cache original method
  const original: any = arrayProto[method];
  def(arrayMethods, method, function mutator(...args: any) {
    // @ts-ignore
    const result = original.apply(this, args);
    // @ts-ignore
    const ob: any = this.__ob__;
    let inserted: any;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
    }
    if (inserted) { ob.observeArray(inserted); }
    // notify change
    ob.dependency.notify();
    return result;
  });
});
