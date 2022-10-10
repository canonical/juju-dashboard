import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type Params = {
  userName: string;
  modelName: string;
};

type Entity = {
  id: string;
  type: string;
};

export default function useTableRowClick() {
  const navigate = useNavigate();
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
        navigate(
          `/models/${userName}/${modelName}/app/${appName}/${entity.type}/${entityId}/`
        );
    } else {
      userName &&
        modelName &&
        entity &&
        navigate(`/models/${userName}/${modelName}/${entity.type}/${entityId}`);
    }
  }, [entity, navigate, modelName, userName]);

  return (entityType: string, entityId: string, e: MouseEvent) => {
    const target = e.target as HTMLDivElement;
    if (target.className.indexOf("p-checkbox") !== -1) {
      // If the user has clicked the checkbox or its labels then do not navigate
      return;
    }
    setEntity({ type: entityType, id: entityId });
  };
}
