import { useEffect, useMemo, useState } from "react";
import { useSelector, useStore } from "react-redux";
import { useParams } from "react-router-dom";
import { getActionsForApplication } from "juju";
import { getModelUUID } from "app/selectors";

import type { EntityDetailsRoute } from "components/Routes/Routes";

import Aside from "components/Aside/Aside";
import PanelHeader from "components/PanelHeader/PanelHeader";

export default function ActionsPanel(): JSX.Element {
  const appState = useStore().getState();
  const { modelName } = useParams<EntityDetailsRoute>();
  const getModelUUIDMemo = useMemo(() => getModelUUID(modelName), [modelName]);
  // @ts-ignore
  const modelUUID = useSelector(getModelUUIDMemo);
  const [actionData, setActionData] = useState();

  useEffect(() => {
    getActionsForApplication("ceph", modelUUID, appState).then((actions) => {
      if (actions?.results?.[0]?.actions) {
        setActionData(actions.results[0].actions);
      }
    });
  }, [appState, modelUUID]);

  const title = <div>0 3 units selected</div>;
  return (
    <Aside width="narrow">
      <div className="p-panel actions-panel">
        <PanelHeader title={title} />
      </div>
    </Aside>
  );
}
