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
    userName &&
      modelName &&
      entity &&
      history.push(
        `/models/${userName}/${modelName}/${entity.type}/${entityId}`
      );
  }, [entity, history, modelName, userName]);

  return (entityType: string, entityId: string) => {
    setEntity({ type: entityType, id: entityId });
  };
}
