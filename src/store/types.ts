export type GenericItemsState<I, E> = {
  items: I[] | null;
} & GenericState<E>;

export type GenericState<E> = {
  errors: E | null;
  loaded: boolean;
  loading: boolean;
};
