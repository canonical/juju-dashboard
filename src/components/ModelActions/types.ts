import type { ButtonProps } from "@canonical/react-components";
import type { PropsWithChildren } from "react";

export type Props = {
  modelName: string;
  modelUUID: string;
  activeUser: string;
} & PropsWithChildren &
  Partial<ButtonProps>;

export enum Label {
  ACCESS = "Manage access",
}
