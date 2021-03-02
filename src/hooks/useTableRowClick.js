import { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";

export default function useTableRowClick() {
  const history = useHistory();
  const [entity, setEntity] = useState(null);
  const { userName, modelName } = useParams();
  useEffect(() => {
    const entityId = entity && entity.id.replace("/", "-");
    userName &&
      modelName &&
      entity &&
      history.push(
        `/models/${userName}/${modelName}/${entity.type}/${entityId}`
      );
  }, [entity, history, modelName, userName]);
  return (entityType, entityId) => {
    setEntity({ type: entityType, id: entityId });
  };
}
