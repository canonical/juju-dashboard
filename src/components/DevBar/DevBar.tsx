import { Accordion, Button, Card, Icon } from "@canonical/react-components";
import classNames from "classnames";
import type { JSX } from "react";

import useLocalStorage from "hooks/useLocalStorage";

import { useWidgets } from "./widgets";

const MINIMISED_KEY = "DEV_minimised";

export default function DevBar(): JSX.Element | null {
  const [minimised, setMinimised] = useLocalStorage(MINIMISED_KEY, false);
  const sections = useWidgets();

  if (!import.meta.env.DEV) {
    console.error("`<DevBar />` rendered in non-dev mode");
    return null;
  }

  return (
    <div className="dev-bar">
      {minimised ? (
        <Button hasIcon onClick={() => setMinimised(false)}>
          <Icon name="code" />
        </Button>
      ) : null}

      <Card highlighted className={classNames({ minimised })}>
        <Button hasIcon onClick={() => setMinimised(true)}>
          <Icon name="chevron-left" />
          <span>Minimise</span>
        </Button>

        <Accordion className="dev-bar__accordion" sections={sections} />
      </Card>
    </div>
  );
}
