import type React from "react";

export type Widget = {
  useShouldRender?: () => boolean;
  Title: React.FC;
  Widget: React.FC;
};
