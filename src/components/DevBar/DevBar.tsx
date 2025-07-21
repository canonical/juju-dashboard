import { Accordion, Button, Card, Icon } from "@canonical/react-components";
import classNames from "classnames";

import useLocalStorage from "hooks/useLocalStorage";

import { WIDGETS } from "./widgets";

const MINIMISED_KEY = "DEV_minimised";

export default function DevBar() {
  const [minimised, setMinimised] = useLocalStorage(MINIMISED_KEY, false);

  if (!import.meta.env.DEV) {
    console.error("`<DevBar />` rendered in non-dev mode");
    return null;
  }

  const sections = WIDGETS.map(({ Title, Widget, useShouldRender }) => {
    const shouldRender = useShouldRender?.() ?? true;
    return shouldRender ? { Title, Widget } : null;
  }).map(({ Title, Widget }) => ({
    title: <Title />,
    content: <Widget />,
  }));

  return (
    <div className="dev-bar">
      {minimised && (
        <Button hasIcon onClick={() => setMinimised(false)} appearance="">
          <Icon name="code" />
        </Button>
      )}

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
