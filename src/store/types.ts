export type GenericItemsState<I, E> = GenericState<E> & {
  items: I[] | null;
};

export type GenericState<E> = {
  errors: E | null;
  loaded: boolean;
  loading: boolean;
};
