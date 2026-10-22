import { Resource } from '@angular/core';

/**
 * The resource's value, or undefined while it is loading or has failed.
 * Reading `value()` directly throws when the resource is in an error state.
 */
export function valueOf<T>(resource: Resource<T>): T | undefined {
  return resource.hasValue() ? resource.value() : undefined;
}
