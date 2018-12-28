import { defineReactive } from '.';
import Dependency, { popTarget, pushTarget } from './dependency';

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 *
 * @class Watcher
 * @constructor
 */
export default class Watcher {
  public value: any;
  // tslint:disable-next-line:ban-types
  private getter: Function;
  // tslint:disable-next-line:ban-types
  private callbacks: Function[];

  // tslint:disable-next-line:ban-types
  constructor(getter: Function, callbacks?: Function[], isWatchable: boolean = false) {
    this.getter = getter;
    this.callbacks = callbacks || [];
    this.value = this.get();
    if (isWatchable) {
      defineReactive(this, 'value', this.value);
    }
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   *
   * @method Watcher.get
   */
  public get() {
    pushTarget(this);
    let value: any;
    try {
      value = this.getter();
    }
    catch (error) {
      console.error('Evaluation of watcher failed with message: ' + error.message);
    }
    popTarget();
    return value;
  }

  /**
   * Add a dependency to this directive
   *
   * @method Watcher.addDependency
   * @param dependency dependency to add
   */
  public addDependency(dependency: Dependency) {
    if (dependency.subscriptions.indexOf(this) === -1) {
      dependency.addSubscription(this);
    }
  }

  /**
   * Called when a dependency changes to fire the callback function
   *
   * @method Watcher.update
   */
  public update() {
    const value = this.get();
    const oldValue = this.value;
    this.value = value;

    this.invokeCallbacks(value, oldValue);
  }

  /**
   * Adds a callback function to the watcher to be called when the watcher's value changes
   *
   * @method Watcher.addCallback
   * @param callback callback function to add to watcher
   */
  // tslint:disable-next-line:ban-types
  public addCallback(callback: Function) {
    this.callbacks.push(callback);
  }

  /**
   * Invokes all callbacks on this watcher when the value of the watcher changes
   *
   * @access private
   * @method Watcher.invokeCallbacks
   * @param value new watcher value
   * @param oldValue old watcher value
   */
  private invokeCallbacks(value: any, oldValue?: any) {
    if (this.callbacks && this.callbacks.length > 0) {
      for (const callback of this.callbacks) {
        try {
          callback(value, oldValue);
        }
        catch (error) {
          console.error('Callback function for watcher threw an error with message: ' + error.message);
        }
      }
    }
  }
}
