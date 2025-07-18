import {
  Accordion,
  Button,
  Card,
  FormikField,
  Icon,
  Input,
} from "@canonical/react-components";
import classNames from "classnames";
import { Formik, Form, FieldArray } from "formik";
import { useEffect, useState } from "react";
import reactHotToast from "react-hot-toast";

import EntityInfo from "components/EntityInfo";
import { login } from "components/LogIn/UserPassForm";
import ToastCard from "components/ToastCard";
import { ENABLED_FLAGS } from "consts";
import useLocalStorage from "hooks/useLocalStorage";
import {
  getControllerConnection,
  getWSControllerURL,
  isLoggedIn,
} from "store/general/selectors";
import { useAppDispatch, useAppSelector } from "store/store";

const USER_CREDENTIALS_KEY = "DEV__user-credentials";
const AUTO_LOGIN_KEY = "DEV__auto-login";
const MINIMISED_KEY = "DEV_minimised";

export default function DevBar() {
  const [minimised, setMinimised] = useLocalStorage(MINIMISED_KEY, false);

  if (!import.meta.env.DEV) {
    console.error("`<DevBar />` rendered in non-dev mode");
    return null;
  }

  return (
    <div className="dev-bar">
      {minimised && (
        <Button hasIcon onClick={() => setMinimised(false)} appearance="">
          <Icon name="code" />
        </Button>
      )}

      <Card highlighted className={classNames({ minimised })}>
        <Button hasIcon onClick={() => setMinimised(true)}>
          <Icon name="chevron-left" />
          <span>Minimise</span>
        </Button>

        <Accordion
          className="dev-bar__accordion"
          sections={[
            { content: <Controller />, title: <ControllerTitle /> },
            { content: <JujuUser />, title: <JujuUserTitle /> },
            { content: <FeatureFlags />, title: <FeatureFlagsTitle /> },
          ]}
        />
      </Card>
    </div>
  );
}

function StatusTitle({
  title,
  status,
  label,
}: {
  title: string;
  status?: boolean;
  label: string;
}) {
  return (
    <>
      {title}
      <span
        className={classNames("dev-bar__user-status", "u-text--muted", {
          "show-status": status !== undefined,
          positive: status,
        })}
      >
        {label}
      </span>
    </>
  );
}

function ControllerTitle() {
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const connection = useAppSelector((state) =>
    getControllerConnection(state, wsControllerURL),
  );

  const connected = connection !== undefined;

  return (
    <StatusTitle
      title="Controller"
      status={connected}
      label={connected ? "Connected" : "Disconnected"}
    />
  );
}

function Controller() {
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const connection = useAppSelector((state) =>
    getControllerConnection(state, wsControllerURL),
  );

  const [hint, setHint] = useState(null as string | null);
  const [items, setItems] = useState({} as Record<string, React.ReactNode>);

  useEffect(() => {
    if (!wsControllerURL) {
      setHint(
        "No controller URL is detected. Please check configuration and try again.",
      );

      return;
    }

    const httpsControllerURL = new URL(wsControllerURL);
    httpsControllerURL.protocol = httpsControllerURL.protocol.replace(
      "ws",
      "http",
    );
    httpsControllerURL.pathname = "/";

    setItems((items) => ({
      ...items,
      "Controller URL": (
        <a
          href={httpsControllerURL.toString()}
          target="_blank"
          rel="noreferrer"
        >
          {wsControllerURL}
        </a>
      ),
    }));

    return () => {
      setItems((items) => {
        delete items["Controller URL"];

        return { ...items };
      });
    };
  }, [wsControllerURL]);

  useEffect(() => {
    if (!connection) {
      setHint(
        "Unable to connect to controller. Visit the controller URL, and ensure that HTTPS certificates have been accepted.",
      );

      return;
    }

    setHint(null);
    setItems((items) => ({
      ...items,
      "Sever version": connection.serverVersion,
      "Controller access": connection.user?.["controller-access"],
      Identity: connection.user?.identity,
    }));

    return () => {
      setItems((items) => {
        for (const key of ["Server version", "Controller access", "Identity"]) {
          delete items[key];
        }

        return { ...items };
      });
    };
  }, [connection]);

  return (
    <>
      {hint && <p>{hint}</p>}
      <EntityInfo data={items} />
    </>
  );
}

function JujuUserTitle() {
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const userIsLoggedIn = useAppSelector((state) =>
    isLoggedIn(state, wsControllerURL),
  );

  return (
    <StatusTitle
      title="Juju User"
      status={userIsLoggedIn}
      label={userIsLoggedIn ? "Logged in" : "Logged out"}
    />
  );
}

function JujuUser() {
  const wsControllerURL = useAppSelector(getWSControllerURL);

  const [credential, setCredential] = useLocalStorage(USER_CREDENTIALS_KEY, {
    user: "",
    password: "",
  });
  const [autoLogin, setAutoLogin] = useLocalStorage(AUTO_LOGIN_KEY, false);

  useAutoLogin(autoLogin, wsControllerURL, credential);

  function saveUserCredentials(credential: { user: string; password: string }) {
    setCredential(credential);
    sendToast("Saved user credentials");
  }

  return (
    <>
      <p>
        Enter a local user's username and password to automatically login. This
        will save the user's credentials in local storage.
      </p>
      <Formik initialValues={credential} onSubmit={saveUserCredentials}>
        <Form>
          <FormikField
            type="text"
            name="user"
            label="Username"
            placeholder="admin"
          />
          <FormikField
            type="password"
            name="password"
            label="Password"
            placeholder="•••••"
          />

          <div className="dev-bar__form-controls">
            <Input
              type="checkbox"
              label="Auto Login"
              checked={autoLogin}
              onChange={(ev) => setAutoLogin(ev.target.checked)}
            />

            <Button type="submit">Save</Button>
          </div>
        </Form>
      </Formik>
    </>
  );
}

function useAutoLogin(
  enabled: boolean,
  wsControllerURL: string | undefined,
  credential: { user: string; password: string },
) {
  const dispatch = useAppDispatch();
  const userIsLoggedIn = useAppSelector((state) =>
    isLoggedIn(state, wsControllerURL),
  );
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (enabled) {
      setAttempted(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled && !attempted && !userIsLoggedIn) {
      setAttempted(true);
      login(dispatch, wsControllerURL, credential);
      sendToast("Automatically logged in.");
    }
  }, [
    enabled,
    attempted,
    userIsLoggedIn,
    dispatch,
    wsControllerURL,
    credential,
  ]);
}

function FeatureFlagsTitle() {
  const [enabledFlags] = useLocalStorage<string[]>(ENABLED_FLAGS, []);

  return (
    <StatusTitle
      title="Feature flags"
      label={
        // TODO: This won't get updated without a refresh, since it's just pulling from local storage.
        `${enabledFlags.length} enabled`
      }
    />
  );
}

function FeatureFlags() {
  const [enabledFlags, setEnabledFlags] = useLocalStorage<string[]>(
    ENABLED_FLAGS,
    [],
  );

  function saveFlags({ enabledFlags }: { enabledFlags: string[] }) {
    setEnabledFlags(enabledFlags);
    sendToast("Feature flags saved to local storage.");
  }

  return (
    <>
      <Formik initialValues={{ enabledFlags }} onSubmit={saveFlags}>
        {({ values }) => (
          <Form>
            <FieldArray
              name="enabledFlags"
              render={(arrayHelpers) => (
                <>
                  {values.enabledFlags.map((flag, index) => (
                    <div key={index} className="dev-bar__feature-flags__flag">
                      <Button
                        hasIcon
                        onClick={() => arrayHelpers.remove(index)}
                      >
                        <Icon name="delete" />
                      </Button>

                      <FormikField name={`enabledFlags.${index}`} type="text" />
                    </div>
                  ))}

                  <div className="dev-bar__form-controls">
                    <Button hasIcon onClick={() => arrayHelpers.push("")}>
                      <Icon name="plus" />
                      <span>Add Flag</span>
                    </Button>

                    <Button type="submit">Save</Button>
                  </div>
                </>
              )}
            />
          </Form>
        )}
      </Formik>
    </>
  );
}

function sendToast(message: string) {
  reactHotToast.custom((toast) => (
    <ToastCard type="positive" toastInstance={toast}>
      {message}
    </ToastCard>
  ));
}
