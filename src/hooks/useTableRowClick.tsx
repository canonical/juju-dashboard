import { MouseEvent, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import urls from "urls";

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
    if (!userName || !modelName || !entityId) {
      return;
    }
    let url: string | null = null;
    if (entity?.type === "unit") {
      const appName = entityId?.split("-").slice(0, -1).join("-");
      url = urls.model.unit({
        userName,
        modelName,
        appName,
        unitId: entityId,
      });
    } else if (entity?.type === "machine") {
      url = urls.model.machine({
        userName,
        modelName,
        machineId: entityId,
      });
    } else if (entity?.type === "app") {
      url = urls.model.app({
        userName,
        modelName,
        appName: entityId,
      });
    }
    if (url) {
      navigate(url);
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
