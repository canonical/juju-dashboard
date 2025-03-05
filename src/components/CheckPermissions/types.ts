import type { PropsWithChildren } from "react";

export type Props = {
  allowed?: boolean;
  loading?: boolean;
} & PropsWithChildren;
