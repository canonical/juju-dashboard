import { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";

type Params = {
  userName: string;
  modelName: string;
};

type Entity = {
  id: string;
  type: string;
};

export default function useTableRowClick() {
  const history = useHistory();
  const [entity, setEntity] = useState<Entity | null>(null);
  const { userName, modelName } = useParams<Params>();

  useEffect(() => {
    const entityId = entity && entity.id.replace("/", "-");
    if (entity?.type === "unit") {
      const appName = entityId?.split("-").slice(0, -1).join("-");
      userName &&
        modelName &&
        entity &&
        appName &&
        history.push(
          `/models/${userName}/${modelName}/app/${appName}/${entity.type}/${entityId}/`
        );
    } else {
      userName &&
        modelName &&
        entity &&
        history.push(
          `/models/${userName}/${modelName}/${entity.type}/${entityId}`
        );
    }
  }, [entity, history, modelName, userName]);

  return (entityType: string, entityId: string, e: MouseEvent) => {
    const target = e.target as HTMLDivElement;
    if (target.className.indexOf("p-checkbox") !== -1) {
      // If the user has clicked the checkbox or its labels then do not navigate
      return;
    }
    setEntity({ type: entityType, id: entityId });
  };
}
