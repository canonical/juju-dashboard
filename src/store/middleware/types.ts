type MockAction = (action: unknown) => unknown;

export type MockMiddlewareResult = Promise<(next: MockAction) => MockAction>;

export enum ModelsError {
  LOAD_ALL_MODELS = "Unable to load models.",
  LOAD_SOME_MODELS = "Unable to load some models.",
  LOAD_LATEST_MODELS = "Unable to load latest model data.",
  LIST_OR_UPDATE_MODELS = "Unable to list or update models.",
}
