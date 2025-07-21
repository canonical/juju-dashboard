import { Widget } from "./types";
import { default as controller } from "./controller";
import { default as featureFlags } from "./feature-flags";
import { default as jujuUser } from "./juju-user";

export type { Widget } from "./types";

export const WIDGETS: Widget[] = [controller, featureFlags, jujuUser];

export { controller, featureFlags, jujuUser };

export function useWidgets() {
  const widgets = [];

  for (const { useShouldRender, Title, Widget } of WIDGETS) {
    const shouldRender = useShouldRender?.() ?? true;

    if (shouldRender) {
      widgets.push({ Title, Widget });
    }
  }

  return widgets;
}
