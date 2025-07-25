import { default as controller } from "./controller";
import { default as featureFlags } from "./feature-flags";
import { default as jujuUser } from "./juju-user";
import type { Widget } from "./types";

export type { Widget } from "./types";

const WIDGETS: Widget[] = [controller, featureFlags, jujuUser];

export function useWidgets() {
  const sections = WIDGETS.map(({ Title, Widget }) => {
    const title = <Title />;

    if (!title) {
      return null;
    }

    return { title, content: <Widget /> };
  }).filter((widget) => widget !== null);

  return sections;
}
