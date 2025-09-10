import type { JSX } from "react";
import { useEffect, useState } from "react";

import EntityInfo from "components/EntityInfo";
import {
  getControllerConnection,
  getWSControllerURL,
} from "store/general/selectors";
import { useAppSelector } from "store/store";

import { StatusTitle } from "./StatusTitle";
import type { Widget } from "./types";

export default {
  Title: (): JSX.Element => {
    const wsControllerURL = useAppSelector(getWSControllerURL);
    const connection = useAppSelector((state) =>
      getControllerConnection(state, wsControllerURL),
    );

    const connected = Boolean(connection);

    return (
      <StatusTitle
        title="Controller"
        status={connected}
        label={connected ? "Connected" : "Disconnected"}
      />
    );
  },
  Widget: (): JSX.Element => {
    const wsControllerURL = useAppSelector(getWSControllerURL);
    const connection = useAppSelector((state) =>
      getControllerConnection(state, wsControllerURL),
    );

    const [hint, setHint] = useState<null | string>(null);
    const [items, setItems] = useState<Record<string, React.ReactNode>>({});

    useEffect(() => {
      if (wsControllerURL === null || !wsControllerURL) {
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

      setItems((currentItems) => ({
        ...currentItems,
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

      return (): void => {
        setItems((currentItems) => {
          delete currentItems["Controller URL"];

          return { ...currentItems };
        });
      };
    }, [wsControllerURL]);

    useEffect(() => {
      if (!connection) {
        if (wsControllerURL !== null && wsControllerURL) {
          // Don't override any existing error.
          setHint(
            "Unable to connect to controller. Visit the controller URL, and ensure that HTTPS certificates have been accepted.",
          );
        }

        return;
      }

      setHint(null);
      setItems((currentItems) => ({
        ...currentItems,
        "Server version": connection.serverVersion,
        "Controller access": connection.user?.["controller-access"],
        Identity: connection.user?.identity,
      }));

      return (): void => {
        setItems((currentItems) => {
          for (const key of [
            "Server version",
            "Controller access",
            "Identity",
          ]) {
            delete currentItems[key];
          }

          return { ...currentItems };
        });
      };
    }, [wsControllerURL, connection]);

    return (
      <>
        {hint !== null && hint ? <p>{hint}</p> : null}
        <EntityInfo data={items} />
      </>
    );
  },
} satisfies Widget;
