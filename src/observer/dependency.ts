import Watcher from './watcher';

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 *
 * @class Dependency
 * @constructor
 */
export default class Dependency {
  public static target: Watcher;
  public subscriptions: Watcher[] = [];

  /**
   * Add a watcher as a subscriber to the current dependency
   *
   * @method Dependency.addSubscription
   * @param subscription subscription to add
   */
  public addSubscription(subscription: Watcher) {
    this.subscriptions.push(subscription);
  }

  /**
   * Remove a subscription from the watcher
   *
   * @method Dependency.removeSubscription
   * @param subscription subscription to remove
   */
  public removeSubscription(subscription: Watcher) {
    this.subscriptions.splice(this.subscriptions.indexOf(subscription), 1);
  }

  /**
   * Add current dependency to the target watcher
   *
   * @method Dependency.depend
   */
  public depend() {
    if (Dependency.target) {
      Dependency.target.addDependency(this);
    }
  }

  /**
   * Notify watchers of changes to dependencies
   *
   * @method Dependency.notify
   */
  public notify() {
    for (const subscription of this.subscriptions) {
      subscription.update();
    }
  }
}

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dependency.target = null;
const targetStack = [];

export function pushTarget(target: Watcher) {
  if (Dependency.target) { targetStack.push(Dependency.target); }
  Dependency.target = target;
}

export function popTarget() {
  Dependency.target = targetStack.pop();
}
