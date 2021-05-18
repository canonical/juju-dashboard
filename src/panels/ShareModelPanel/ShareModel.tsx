import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Formik, Field, Form } from "formik";
import cloneDeep from "clone-deep";
import useModelStatus from "hooks/useModelStatus";
import { formatFriendlyDateToNow } from "app/utils/utils";

import Aside from "components/Aside/Aside";
import PanelHeader from "components/PanelHeader/PanelHeader";
import FormikFormData from "components/FormikFormData/FormikFormData";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import type { TSFixMe } from "types";

import "./share-model.scss";

export default function ShareModel() {
  const { modelName } = useParams<EntityDetailsRoute>();

  const modelStatusData: TSFixMe = useModelStatus() || null;

  const users = modelStatusData?.info?.users;
  const [usersAccess, setUsersAccess] = useState({});

  useEffect(() => {
    const clonedUserAccess = cloneDeep(usersAccess);
    users?.forEach((user: TSFixMe) => {
      const displayName = user["user"];
      // @ts-ignore
      clonedUserAccess[displayName] = user["access"];
    });
    setUsersAccess(clonedUserAccess);
  }, [users]);

  const isOwner = (user: string) => {
    return user === modelStatusData?.info["owner-tag"].replace("user-", "");
  };

  type User = {
    user: string;
    "display-name": string;
    "last-connection": string;
    access: string;
  };

  const handleRemoveUser = (userName: string) => {
    console.log(`Removing ${userName}`);
  };

  return (
    <Aside loading={!modelStatusData} isSplit={true}>
      <div className="p-panel share-model">
        <PanelHeader
          title={
            <div className="title-wrapper">
              <i className="p-icon--share"></i>
              <h4>Share {modelName}</h4>
            </div>
          }
        />
        <div className="p-panel__content aside-split-wrapper">
          <div className="aside-split-col">
            <h5>Sharing with:</h5>
            {users?.map((userObj: User) => {
              const userName = userObj["user"];
              const lastConnected = userObj["last-connection"];

              return (
                <div className="share-model__card" key={userObj.user}>
                  <div className="share-model__card-title">
                    <strong>{userName}</strong>
                    <span className="secondary">
                      {isOwner(userName) ? (
                        "Owner"
                      ) : (
                        <i
                          className="p-icon--delete"
                          onClick={() => handleRemoveUser(userName)}
                          onKeyPress={() => handleRemoveUser(userName)}
                          role="button"
                          tabIndex={0}
                        >
                          Remove user
                        </i>
                      )}
                    </span>
                  </div>
                  <div className="supplementary">
                    Last connected:{" "}
                    {lastConnected
                      ? formatFriendlyDateToNow(lastConnected)
                      : `Never connected`}
                    <Formik
                      initialValues={{
                        selectAll: false,
                        selectedUnits: [],
                      }}
                      onSubmit={() => {
                        console.log("Submitting form");
                      }}
                    >
                      <FormikFormData
                        onFormChange={() => {
                          //console.log("on form change");
                        }}
                        onSetup={() => {
                          //console.log("on set up");
                        }}
                      >
                        <Field
                          as="select"
                          name="accessLevel"
                          onChange={async (e: TSFixMe) => {
                            const cloneUserAccess = cloneDeep(usersAccess);
                            // @ts-ignore
                            cloneUserAccess[userName] = e.target.value;
                            setUsersAccess(cloneUserAccess);
                          }}
                          // @ts-ignore
                          value={usersAccess?.[userName]}
                        >
                          <option value="read">Read</option>
                          <option value="write">Write</option>
                          <option value="admin">Admin</option>
                        </Field>
                      </FormikFormData>
                    </Formik>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="aside-split-col">
            <h4>Add new user</h4>

            <Formik
              initialValues={{
                username: "",
                accessLevel: "read",
              }}
              onSubmit={async (values) => {
                console.log(JSON.stringify(values, null, 2));
              }}
            >
              <Form>
                <label className="is-required" htmlFor="username">
                  Username
                </label>
                <Field
                  required
                  type="text"
                  placeholder="Username"
                  name="username"
                />
                <label className="is-required" htmlFor="accessLevel">
                  Access level
                </label>
                <div className="p-radio">
                  <label htmlFor="accessRead">
                    <Field
                      id="accessRead"
                      type="radio"
                      className="p-radio__input"
                      name="accessLevel"
                      aria-labelledby="Read"
                      value="read"
                    />
                    <span className="p-radio__label" id="accessLevel1">
                      read
                      <span className="help-text">
                        A user can view the state of the model
                      </span>
                    </span>
                  </label>
                </div>

                <div className="p-radio">
                  <label htmlFor="accessWrite">
                    <Field
                      id="accessWrite"
                      type="radio"
                      className="p-radio__input"
                      name="accessLevel"
                      aria-labelledby="Write"
                      value="write"
                    />
                    <span className="p-radio__label" id="accessLevel2">
                      write
                      <span className="help-text">
                        In addition to 'read' abilities, a user can
                        modify/configure models
                      </span>
                    </span>
                  </label>
                </div>

                <div className="p-radio">
                  <label htmlFor="accessAdmin">
                    <Field
                      id="accessAdmin"
                      type="radio"
                      className="p-radio__input"
                      name="accessLevel"
                      aria-labelledby="Admin"
                      value="admin"
                    />
                    <span className="p-radio__label" id="accessLevel3">
                      admin
                      <span className="help-text">
                        In addition to 'write' abilities,ys a user can perform
                        model upgrades and connect to machines via juju ssh.
                        Makes the user an effective model owner.
                      </span>
                    </span>
                  </label>
                </div>
                <div className="action-wrapper">
                  <button className="p-button--positive" type="submit">
                    Add user
                  </button>
                </div>
              </Form>
            </Formik>
          </div>
        </div>
      </div>
    </Aside>
  );
}
