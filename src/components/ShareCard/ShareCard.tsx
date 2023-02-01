import { useState, useEffect } from "react";
import { Formik, Field, Form } from "formik";
import { Tooltip } from "@canonical/react-components";

import { formatFriendlyDateToNow } from "app/utils/utils";
import type { TSFixMe } from "types";

import SlideDownFadeOut from "animations/SlideDownFadeOut";

import "./_share-card.scss";

export enum Label {
  OWNER = "Owner",
  REMOVE = "Remove user",
}

type Props = {
  userName: string;
  lastConnected: string | null;
  access: string;
  isOwner: boolean;
  removeUser: (userName: string) => void;
  accessSelectChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    userName: string
  ) => TSFixMe;
};

export default function ShareCard({
  userName,
  lastConnected,
  access,
  isOwner,
  removeUser,
  accessSelectChange,
}: Props) {
  const [inFocus, setInFocus] = useState(false);
  const [hasBeenRemoved, setHasBeenRemoved] = useState(false);
  const [showStatus, setShowStatus] = useState(true);
  const [updateStatus, setUpdateStatus] = useState<null | string>(null);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      setShowStatus(false);
    }, 3000);

    return () => {
      clearTimeout(timeOut);
    };
  }, [showStatus]);

  const getStatusIconClassNames = (status: string | null) => {
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
          <div className="share-card__title u-truncate">
            <Tooltip
              message={userName}
              className="u-truncate"
              positionElementClassName="share-card__tooltip-wrapper"
            >
              <strong className="share-card__username">{userName}</strong>
            </Tooltip>
            <span className="share-card__secondary">
              {isOwner ? (
                Label.OWNER
              ) : (
                <i
                  className="p-icon--delete"
                  onClick={() => {
                    removeUser(userName);
                    setHasBeenRemoved(true);
                  }}
                  onKeyPress={() => removeUser(userName)}
                  role="button"
                  tabIndex={0}
                >
                  {Label.REMOVE}
                </i>
              )}
            </span>
          </div>
          <div className="share-card__supplementary">
            Last connected:{" "}
            {lastConnected ? formatFriendlyDateToNow(lastConnected) : `Never`}
            <div className="share-card__access-wrapper">
              {!isOwner && (
                <>
                  <Formik initialValues={{}} onSubmit={() => {}}>
                    <Form>
                      <Field
                        as="select"
                        name="access"
                        onFocus={() => setInFocus(true)}
                        onBlur={() => setInFocus(false)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setShowStatus(true);
                          setUpdateStatus("Updating");
                          const accessChange = accessSelectChange(e, userName);
                          if (accessChange) {
                            accessChange.then((response: any) => {
                              if (!response?.results[0]?.error) {
                                setInFocus(false);
                                setUpdateStatus("Updated");
                              } else {
                                setUpdateStatus("Error");
                              }
                            });
                          }
                        }}
                        value={access}
                        className="share__card-access"
                      >
                        <option value="read">read</option>
                        <option value="write">write</option>
                        <option value="admin">admin</option>
                      </Field>
                    </Form>
                  </Formik>

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
