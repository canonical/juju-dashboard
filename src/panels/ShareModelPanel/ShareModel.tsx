import { useParams } from "react-router-dom";
import useModelStatus from "hooks/useModelStatus";
import { formatFriendlyDateToNow } from "app/utils/utils";

import Aside from "components/Aside/Aside";
import PanelHeader from "components/PanelHeader/PanelHeader";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import type { TSFixMe } from "types";

import "./share-model.scss";

export default function ShareModel() {
  const { modelName } = useParams<EntityDetailsRoute>();

  const modelStatusData: TSFixMe = useModelStatus() || null;

  const users = modelStatusData?.info?.users;

  const isOwner = (user: string) => {
    return user === modelStatusData?.info["owner-tag"].replace("user-", "");
  };

  type User = {
    user: string;
    "display-name": string;
    "last-connection": string;
    access: string;
  };

  return (
    <Aside loading={!modelStatusData}>
      <div className="p-panel share-model">
        <PanelHeader
          title={
            <div className="title-wrapper">
              <i className="p-icon--share"></i>
              <h4>Share {modelName}</h4>
            </div>
          }
        />
        <div className="p-panel__content">
          <div>
            <h5>Sharing with:</h5>
            {users?.map((userObj: User) => {
              return (
                <div className="share-model__card" key={userObj.user}>
                  <div className="share-model__card-title">
                    <strong>{userObj["user"]}</strong>
                    <span className="secondary">
                      {isOwner(userObj["user"]) && "Owner"}
                    </span>
                  </div>
                  <p className="supplementary">
                    Last connected:{" "}
                    {userObj["last-connection"]
                      ? formatFriendlyDateToNow(userObj["last-connection"])
                      : `Never connected`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Aside>
  );
}
