import { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";

type Params = {
  userName: string;
  modelName: string;
  appName: string;
};

type Entity = {
  id: string;
  type: string;
};

export default function useTableRowClick() {
  const history = useHistory();
  const [entity, setEntity] = useState<Entity | null>(null);
  const { userName, modelName, appName } = useParams<Params>();

  useEffect(() => {
    const entityId = entity && entity.id.replace("/", "-");
    if (entity?.type === "unit") {
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
  }, [entity, history, modelName, userName, appName]);

  return (entityType: string, entityId: string) => {
    setEntity({ type: entityType, id: entityId });
  };
}
