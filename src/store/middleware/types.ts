type MockAction = (action: unknown) => unknown;

export type MockMiddlewareResult = Promise<(next: MockAction) => MockAction>;
