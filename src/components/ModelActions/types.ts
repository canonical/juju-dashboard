import type {
  ButtonProps,
  ContextualMenuProps,
} from "@canonical/react-components";
import type { PropsWithChildren } from "react";

export type Props = {
  modelName: string;
  modelUUID: string;
  position?: ContextualMenuProps<void>["position"];
  redirectOnDestroy?: boolean;
} & Partial<ButtonProps> &
  PropsWithChildren;

export enum Label {
  ACCESS = "Manage access",
  DESTROY = "Destroy model",
  TOGGLE = "Toggle model actions menu",
}

export enum TestId {
  MENU = "model-actions-menu",
}
