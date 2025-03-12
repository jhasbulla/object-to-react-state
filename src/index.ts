import { useReducer, useEffect, useRef } from 'react';

type Subscriber = () => void;

/**
 * Extends a plain object with an optional __reactive property.
 * The __reactive property stores methods for subscribing, unsubscribing,
 * and notifying changes.
 */
export type ReactiveObject<T extends object> = T & {
  __reactive?: {
    subscribe: (subscriber: Subscriber) => void;
    unsubscribe: (subscriber: Subscriber) => void;
    notify: () => void;
  };
};

/**
 * Enhances an object to become reactive by patching its properties.
 * It replaces each existing property with getters and setters that trigger a notification on change.
 * It also adds a non-enumerable __reactive property that manages subscribers.
 *
 * @param obj - The object to be patched.
 * @param initialSubscriber - A subscriber function (typically used to force a component re-render).
 */
function patchObject<T extends object>(obj: T, initialSubscriber: Subscriber) {
  // Create a reactive mechanism that maintains a set of subscribers.
  const reactive = {
    subscribers: new Set<Subscriber>([initialSubscriber]),
    subscribe(subscriber: Subscriber) {
      this.subscribers.add(subscriber);
    },
    unsubscribe(subscriber: Subscriber) {
      this.subscribers.delete(subscriber);
    },
    notify() {
      // Trigger each subscriber (e.g., force a re-render).
      this.subscribers.forEach((fn) => fn());
    },
  };

  // Define a non-enumerable __reactive property on the object to store the reactive mechanism.
  Object.defineProperty(obj, '__reactive', {
    value: reactive,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  // Patch each existing property to include reactive getters and setters.
  for (const key of Object.keys(obj)) {
    let value = (obj as any)[key];
    Object.defineProperty(obj, key, {
      get() {
        return value;
      },
      set(newVal) {
        value = newVal;
        // Notify subscribers when a property value is updated.
        reactive.notify();
      },
      configurable: true,
      enumerable: true,
    });
  }
}

/**
 * Custom React hook that transforms an object into a reactive object.
 *
 * This hook patches the object's properties so that any update triggers a re-render.
 * Optionally, it can poll for new properties added to the object (if unsafePollingForAddedProperties is true)
 * and patch those as well.
 *
 * @param obj - The object to be made reactive.
 * @param options - Optional settings for polling:
 *   - unsafePollingForAddedProperties (default: false): If true, the hook will periodically check for new properties.
 *   - pollingInterval (default: 1000ms): The interval (in milliseconds) between polls.
 * @returns The same object, now enhanced with reactive capabilities.
 */
export function useObjectToState<T extends object>(
  obj: T,
  options?: {
    unsafePollingForAddedProperties?: boolean;
    pollingInterval?: number;
  }
): T {
  const { unsafePollingForAddedProperties = false, pollingInterval = 1000 } = options || {};
  // useReducer is used here solely to force a re-render when changes occur.
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // Save the initial set of keys to later detect if new properties have been added.
  const initialKeys = useRef(new Set(Object.keys(obj)));

  // If the object hasn't been patched yet, patch it to add reactivity.
  if (!(obj as ReactiveObject<T>).__reactive) {
    patchObject(obj, forceUpdate);
  } else {
    // If already patched, simply subscribe the forceUpdate function for notifications.
    (obj as ReactiveObject<T>).__reactive!.subscribe(forceUpdate);
  }

  useEffect(() => {
    let intervalId: number | undefined;

    if (unsafePollingForAddedProperties) {
      // Start an interval to check for any new properties added to the object.
      intervalId = window.setInterval(() => {
        const currentKeys = new Set(Object.keys(obj));
        let newPropertyFound = false;
        // Calculate the difference between the current keys and the initial keys.
        // Note: This code assumes a 'difference' method exists on Set. If not, you'll need to implement one.
        const newKeys = currentKeys.difference(initialKeys.current);

        // Patch any new properties so they become reactive.
        newKeys.forEach((key) => {
          newPropertyFound = true;
          let value = (obj as any)[key];
          Object.defineProperty(obj, key, {
            get() {
              return value;
            },
            set(newVal) {
              value = newVal;
              // Notify subscribers if the object has been patched.
              if ((obj as ReactiveObject<T>).__reactive) {
                (obj as ReactiveObject<T>).__reactive!.notify();
              }
            },
            configurable: true,
            enumerable: true,
          });
          // Add the new key to the initialKeys set to avoid re-patching later.
          initialKeys.current.add(key);
        });
        // If any new property was patched, notify subscribers.
        if (newPropertyFound && (obj as ReactiveObject<T>).__reactive) {
          (obj as ReactiveObject<T>).__reactive!.notify();
        }
      }, pollingInterval);
    }

    // Cleanup: clear the polling interval and unsubscribe forceUpdate.
    return () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
      if ((obj as ReactiveObject<T>).__reactive) {
        (obj as ReactiveObject<T>).__reactive!.unsubscribe(forceUpdate);
      }
    };
  }, [obj, unsafePollingForAddedProperties, pollingInterval]);

  return obj;
}
