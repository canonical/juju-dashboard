import type { ModelUserInfo } from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV9";
import classNames from "classnames";
import type { PropsWithChildren } from "react";

import AccessButton from "components/AccessButton";
import useCanConfigureModel from "hooks/useCanConfigureModel";

import { Label } from "./types";

type Props = PropsWithChildren & {
  activeUser: string;
  modelName?: string;
  modelUsers?: ModelUserInfo[];
};

const AccessColumn = ({ children, activeUser, modelName, ...props }: Props) => {
  const canConfigureModel = useCanConfigureModel(false, modelName, activeUser);
  return (
    <div
      className={classNames({
        "has-permission": canConfigureModel,
      })}
    >
      {canConfigureModel ? (
        <AccessButton
          {...props}
          modelName={modelName}
          dense
          className="model-access"
        >
          {Label.ACCESS_BUTTON}
        </AccessButton>
      ) : null}
      <span className="model-access-alt">{children}</span>
    </div>
  );
};

export default AccessColumn;
