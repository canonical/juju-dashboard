import { ErrorResults } from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV9";
import cloneDeep from "clone-deep";
import { useFormik } from "formik";
import { motion } from "framer-motion";
import useModelStatus from "hooks/useModelStatus";
import { useEffect, useState } from "react";
import reactHotToast from "react-hot-toast";
import { useSelector } from "react-redux";

import { actions as appActions } from "store/app";
import { getModelControllerDataByUUID } from "store/juju/selectors";

import Aside from "components/Aside/Aside";
import PanelHeader from "components/PanelHeader/PanelHeader";
import ShareCard from "components/ShareCard/ShareCard";
import ToastCard from "components/ToastCard/ToastCard";
import { usePromiseDispatch } from "store/store";

import { Input, RadioInput } from "@canonical/react-components";
import "./share-model.scss";

type User = {
  user: string;
  "display-name": string;
  "last-connection": string | null;
  access: string;
};

type UsersAccess = {
  [key: string]: string;
};

type UserAccess = {
  username: string;
  access: string | null;
};

export default function ShareModel() {
  const promiseDispatch = usePromiseDispatch();
  const [usersAccess, setUsersAccess] = useState<UsersAccess>({});
  const [newUserFormSubmitActive, setNewUserFormSubmitActive] = useState(false);

  const [showAddNewUser, setShowAddNewUser] = useState(false);

  const modelStatusData = useModelStatus() || null;
  const newUserFormik = useFormik({
    initialValues: {
      username: "",
      access: "read",
    },
    validate: (values) => handleValidateNewUser(values),
    onSubmit: (values, { resetForm }) => {
      handleNewUserFormSubmit(values, resetForm);
      setShowAddNewUser(false);
    },
  });

  const controllerUUID = modelStatusData?.info?.["controller-uuid"];
  const modelUUID = modelStatusData?.info?.uuid;
  const modelName = modelStatusData?.info?.name;

  const modelControllerDataByUUID =
    getModelControllerDataByUUID(controllerUUID);

  const modelControllerData = useSelector(modelControllerDataByUUID);

  const modelControllerURL = modelControllerData?.url;
  const users = modelStatusData?.info?.users;

  useEffect(() => {
    const clonedUserAccess: UsersAccess | null = cloneDeep(usersAccess);

    users?.forEach((user: User) => {
      const displayName = user["user"];

      if (clonedUserAccess) {
        clonedUserAccess[displayName] = user?.["access"];
        setUsersAccess(clonedUserAccess);
      }
    });
  }, [users]); // eslint-disable-line react-hooks/exhaustive-deps

  const isOwner = (user: string) => {
    return user === modelStatusData?.info?.["owner-tag"].replace("user-", "");
  };

  const userAlreadyHasAccess = (username: string, users?: User[]) => {
    return users?.some((userEntry: User) => userEntry.user === username);
  };

  const handleValidateNewUser = (values: UserAccess) => {
    setNewUserFormSubmitActive(
      Boolean(values.username) && Boolean(values.access)
    );
  };

  const updateModelPermissions = async (
    action: string,
    user: string,
    permissionTo: string | undefined,
    permissionFrom: string | undefined
  ) => {
    if (!modelControllerURL || !modelUUID) {
      return;
    }
    let response: ErrorResults | null;
    if (!modelControllerURL || !modelUUID) {
      return;
    }
    try {
      response = await promiseDispatch<ErrorResults>(
        appActions.updatePermissions({
          wsControllerURL: modelControllerURL,
          modelUUID,
          user,
          permissionTo,
          permissionFrom,
          action,
        })
      );
    } catch (error) {
      reactHotToast.custom((t) => (
        <ToastCard
          toastInstance={t}
          type="negative"
          text={
            typeof error === "string"
              ? error
              : "Unable to update model permissions"
          }
        />
      ));
      response = null;
    }
    return response;
  };

  const handleAccessSelectChange = async (
    permissionTo: string,
    username: string
  ) => {
    const clonedUserAccess = cloneDeep(usersAccess);
    if (clonedUserAccess) {
      clonedUserAccess[username] = permissionTo;
    }
    setUsersAccess(clonedUserAccess);
    const permissionFrom = usersAccess?.[username];

    const response = await updateModelPermissions(
      "grant",
      username,
      permissionTo,
      permissionFrom
    );
    let error = response?.results?.[0]?.error?.message ?? null;
    // ignore this error as it means that it's a success
    if (error && error.match(/user already has .+ access or greater/i)) {
      delete response?.results[0];
      error = null;
    }

    if (error) {
      reactHotToast.custom((t) => (
        <ToastCard toastInstance={t} type="negative" text={error!} />
      ));
    } else {
      reactHotToast.custom((t) => (
        <ToastCard
          toastInstance={t}
          type="positive"
          text={`Permissions for <strong>${username}</strong> have been changed to <em>${permissionTo}.</em>`}
        />
      ));
    }
    return response ?? null;
  };

  const handleRemoveUser = async (username: string) => {
    await updateModelPermissions(
      "revoke",
      username,
      undefined,
      usersAccess?.[username]
    );

    reactHotToast.custom((t) => (
      <ToastCard
        toastInstance={t}
        type="positive"
        text={`<strong>${username}</strong> has been successfully removed.`}
        undo={async () => {
          const permissionTo = usersAccess?.[username];
          const permissionFrom = undefined;
          await updateModelPermissions(
            "grant",
            username,
            permissionTo,
            permissionFrom
          );
        }}
      />
    ));
  };

  const handleNewUserFormSubmit = async (
    values: UserAccess,
    resetForm: () => void
  ) => {
    if (userAlreadyHasAccess(values.username, users)) {
      reactHotToast.custom((t) => (
        <ToastCard
          toastInstance={t}
          type="negative"
          text={`<strong>${values.username}</strong> already has access to this model.`}
        />
      ));
    } else {
      const newUserName = values.username;
      const newUserPermission = values.access;
      let response = null;
      if (newUserName && newUserPermission) {
        response = await updateModelPermissions(
          "grant",
          newUserName,
          newUserPermission,
          undefined
        );
      }

      const error = response?.results?.[0]?.error?.message;
      if (error) {
        reactHotToast.custom((t) => (
          <ToastCard toastInstance={t} type="negative" text={error} />
        ));
      } else {
        resetForm();
        reactHotToast.custom((t) => (
          <ToastCard
            toastInstance={t}
            type="positive"
            text={`<strong>${values.username}</strong> now has access to this model.`}
          />
        ));
      }
    }
  };

  // Ensure user with 'owner' status is always the first card
  const sortedUsers = cloneDeep(users || null);
  sortedUsers?.some(
    (item: User, i: number) =>
      isOwner(item.user) && sortedUsers.unshift(sortedUsers.splice(i, 1)[0])
  );

  return (
    <Aside loading={!modelStatusData} isSplit={true}>
      <motion.div layout className="p-panel share-model">
        <PanelHeader
          title={
            <div className="title-wrapper">
              {showAddNewUser ? (
                <>
                  <button
                    className="p-button--base has-icon"
                    onClick={() => setShowAddNewUser(false)}
                  >
                    <i className="p-icon--chevron-up"></i>
                    <span>Back</span>
                  </button>
                </>
              ) : (
                <div className="title-wrapper__heading">
                  <h5>
                    <i className="p-icon--share is-inline"></i> Model access:{" "}
                    {modelName}
                  </h5>
                </div>
              )}
            </div>
          }
        />
        <div
          className="p-panel__content aside-split-wrapper"
          // This attribute toggles between the cards and form on small screens
          data-mobile-show-add-user={showAddNewUser}
        >
          <div className="aside-split-col share-cards">
            <div className="share-cards__heading">
              <h5>Sharing with:</h5>
              <button
                className="add-user-btn p-button--base has-icon"
                onClick={() => setShowAddNewUser(true)}
              >
                <i className="p-icon--plus"></i>
                <span>Add new user</span>
              </button>
            </div>
            {sortedUsers?.map((userObj: User) => {
              const username = userObj["user"];
              const lastConnected = userObj["last-connection"];
              return (
                <ShareCard
                  key={username}
                  userName={username}
                  lastConnected={lastConnected}
                  access={usersAccess?.[username]}
                  isOwner={isOwner(username)}
                  removeUser={handleRemoveUser}
                  accessSelectChange={handleAccessSelectChange}
                />
              );
            })}
          </div>
          <div className="aside-split-col add-new-user">
            <h5>Add new user</h5>
            <form onSubmit={newUserFormik.handleSubmit}>
              <Input
                name="username"
                type="text"
                label="Username"
                required
                value={newUserFormik.values.username}
                onChange={newUserFormik.handleChange}
              />
              <label className="is-required" htmlFor="access">
                Access level
              </label>
              <RadioInput
                label={
                  <>
                    read
                    <span className="help-text">
                      A user can view the state of the model
                    </span>
                  </>
                }
                value="read"
                name="access"
                onChange={newUserFormik.handleChange}
                defaultChecked
              />
              <RadioInput
                label={
                  <>
                    write
                    <span className="help-text">
                      In addition to 'read' abilities, a user can
                      modify/configure models
                    </span>
                  </>
                }
                value="write"
                name="access"
                onChange={newUserFormik.handleChange}
              />
              <RadioInput
                label={
                  <>
                    admin
                    <span className="help-text">
                      In addition to 'write' abilities, a user can perform model
                      upgrades and connect to machines via juju ssh. Makes the
                      user an effective model owner.
                    </span>
                  </>
                }
                value="admin"
                name="access"
                onChange={newUserFormik.handleChange}
              />
              <div className="action-wrapper">
                <button
                  className="p-button--positive"
                  type="submit"
                  disabled={!newUserFormSubmitActive}
                >
                  Add user
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </Aside>
  );
}
