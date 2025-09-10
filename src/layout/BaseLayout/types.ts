import type { StatusView } from "layout/Status";

export enum Label {
  OFFLINE = "Your dashboard is offline.",
}

export type BaseLayoutContext = {
  setStatus: (status: null | StatusView) => void;
};
