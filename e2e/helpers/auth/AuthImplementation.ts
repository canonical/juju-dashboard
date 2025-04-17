import type { Action } from "../action";

import type { User } from ".";

type Constructor<T> = new (username: string, password: string) => T;

/**
 * An auth implementation is an `Action` which must create a `User`. It is provided as a class
 * constructor.
 */
export type AuthImplementation = Constructor<Action<User>>;
