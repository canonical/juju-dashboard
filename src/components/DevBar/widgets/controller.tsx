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
  Title: () => {
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
  },
  Widget: () => {
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
          for (const key of [
            "Server version",
            "Controller access",
            "Identity",
          ]) {
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
  },
} satisfies Widget;
