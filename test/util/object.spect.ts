/* tslint:disable:max-classes-per-file */
import { def, isObject, isPlainObject, prototypeAugment } from '../../src/util/object';

class TestClass { }

describe('object utility functions', () => {
  describe('def', () => {
    const obj: any = {};
    const key: any = 'key';
    const value: any = 55;

    test('defines a property on an object', () => {
      def(obj, key, value);

      expect(obj).toHaveProperty(key);
      expect(obj[key]).toBe(value);
    });

    test('throws an error if parameters are incorrect', () => {
      // object is undefined
      // @ts-ignore
      expect(() => def(undefined, key, value)).toThrow();
    });
  });

  describe('isObject', () => {
    test('identifies values that are objects', () => {
      expect(isObject({})).toBe(true);
      expect(isObject([])).toBe(true);
      expect(isObject(new TestClass())).toBe(true);
    });

    test('identifies values that are not objects', () => {
      expect(isObject(1)).toBe(false);
      expect(isObject('')).toBe(false);
      expect(isObject('test')).toBe(false);
      expect(isObject(0)).toBe(false);
    });
  });

  describe('prototypeAugment', () => {
    test('adds prototype methods of source to target object', () => {
      const source: any = [];
      const augmented: any = {};

      prototypeAugment(augmented, source);

      expect(augmented.splice).toBeDefined();
    });

    test('fails to add prototype methods if target is not an object', () => {
      const source: any = [];
      let augmented: any = 1;

      prototypeAugment(augmented, source);
      expect(augmented.splice).toBeUndefined();

      augmented = 'test';
      prototypeAugment(augmented, source);
      expect(augmented.splice).toBeUndefined();      
    });
  });

  describe('isPlainObject', () => {
    test('identifies values that are plain objects', () => {
      expect(isPlainObject({})).toBe(true);      
    });

    test('identifies values that are not plain objects', () => {
      expect(isPlainObject('test')).toBe(false);
      expect(isPlainObject(1)).toBe(false);
      expect(isPlainObject([])).toBe(false);
      expect(isPlainObject(new TestClass())).toBe(false);
    })
  })
});