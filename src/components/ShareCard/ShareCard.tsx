import type { ErrorResults } from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV9";
import { Button, Select } from "@canonical/react-components";
import type { JSX } from "react";
import { useEffect, useState } from "react";

import SlideDownFadeOut from "animations/SlideDownFadeOut";
import TruncatedTooltip from "components/TruncatedTooltip";
import { formatFriendlyDateToNow } from "components/utils";
import { logger } from "utils/logger";

import { Label } from "./types";

type Props = {
  userName: string;
  lastConnected: null | string;
  access: string;
  isOwner: boolean;
  removeUser: (userName: string) => void;
  accessSelectChange: (
    permissionTo: string,
    userName: string,
  ) => Promise<ErrorResults | null>;
};

export default function ShareCard({
  userName,
  lastConnected,
  access,
  isOwner,
  removeUser,
  accessSelectChange,
}: Props): JSX.Element {
  const [inFocus, setInFocus] = useState(false);
  const [hasBeenRemoved, setHasBeenRemoved] = useState(false);
  const [showStatus, setShowStatus] = useState(true);
  const [updateStatus, setUpdateStatus] = useState<null | string>(null);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      setShowStatus(false);
    }, 3000);

    return (): void => {
      clearTimeout(timeOut);
    };
  }, [showStatus]);

  const getStatusIconClassNames = (status: null | string): string => {
    let classNames = "";
    switch (status) {
      case "Updating":
        classNames = "p-icon--spinner u-animation--spin";
        break;
      case "Updated":
        classNames = "p-icon--success";
        break;
      case "Error":
        classNames = "p-icon--error";
        break;
      default:
        break;
    }
    return classNames;
  };

  return (
    <div>
      <SlideDownFadeOut isAnimating={hasBeenRemoved}>
        <div className="share-card" data-active={inFocus}>
          <div className="share-card__title">
            <TruncatedTooltip message={userName} wrapperClassName="u-truncate">
              <strong className="share-card__username">{userName}</strong>
            </TruncatedTooltip>
            <span className="share-card__secondary">
              {isOwner ? (
                Label.OWNER
              ) : (
                <Button
                  hasIcon
                  small
                  appearance="base"
                  onClick={() => {
                    removeUser(userName);
                    setHasBeenRemoved(true);
                  }}
                  name={Label.REMOVE}
                >
                  <i className="p-icon--delete">{Label.REMOVE}</i>
                </Button>
              )}
            </span>
          </div>
          <div className="share-card__supplementary">
            Last connected:{" "}
            {lastConnected !== null && lastConnected
              ? formatFriendlyDateToNow(lastConnected)
              : `Never`}
            <div className="share-card__access-wrapper">
              {!isOwner && (
                <>
                  <Select
                    name="access"
                    onFocus={() => setInFocus(true)}
                    onBlur={() => setInFocus(false)}
                    onChange={(ev) => {
                      setShowStatus(true);
                      setUpdateStatus("Updating");
                      const accessChange = accessSelectChange(
                        ev.target.value,
                        userName,
                      );
                      accessChange
                        .then((response) => {
                          if (!response?.results?.[0]?.error) {
                            setInFocus(false);
                            setUpdateStatus("Updated");
                          } else {
                            setUpdateStatus("Error");
                          }
                          return;
                        })
                        .catch((error) =>
                          logger.error(Label.ACCESS_CHANGE_ERROR, error),
                        );
                    }}
                    value={access}
                    className="share__card-access"
                    options={[
                      { value: "read", label: "read" },
                      { value: "write", label: "write" },
                      { value: "admin", label: "admin" },
                    ]}
                  />

                  <div className="share-card__status" data-visible={showStatus}>
                    <div
                      className={`share-card__status-wrap ${
                        updateStatus === "updating" ? "is-spinner" : ""
                      }`}
                    >
                      <span className="share-card__status-text">
                        {updateStatus}
                      </span>{" "}
                      <i className={getStatusIconClassNames(updateStatus)}></i>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </SlideDownFadeOut>
    </div>
  );
}
