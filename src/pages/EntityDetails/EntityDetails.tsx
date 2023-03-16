import { useEffect, useState, PropsWithChildren, ReactNode } from "react";
import classNames from "classnames";
import { Spinner, Tabs } from "@canonical/react-components";
import { useSelector, useStore } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { useQueryParams, StringParam, withDefault } from "use-query-params";

import BaseLayout from "layout/BaseLayout/BaseLayout";

import Breadcrumb from "components/Breadcrumb/Breadcrumb";
import Header from "components/Header/Header";
import SlidePanel from "components/SlidePanel/SlidePanel";
import WebCLI from "components/WebCLI/WebCLI";
import NotFound from "components/NotFound/NotFound";

import ConfigPanel from "panels/ConfigPanel/ConfigPanel";
import OffersPanel from "panels/OffersPanel/OffersPanel";
import RemoteAppsPanel from "panels/RemoteAppsPanel/RemoteAppsPanel";

import { getUserPass } from "store/general/selectors";
import {
  getControllerDataByUUID,
  getModelApplications,
  getModelInfo,
  getModelListLoaded,
  getModelUUIDFromList,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";
import useWindowTitle from "hooks/useWindowTitle";

import FadeIn from "animations/FadeIn";
import { useEntityDetailsParams } from "components/hooks";

import "./_entity-details.scss";

export enum Label {
  NOT_FOUND = "Model not found",
}

type Props = {
  type?: string;
  additionalHeaderContent?: JSX.Element;
  onApplicationsFilter?: (query: string) => void;
};

function generatePanelContent(activePanel: string, entity: string) {
  switch (activePanel) {
    case "remoteApps":
      return <RemoteAppsPanel entity={entity} />;
    case "offers":
      return <OffersPanel entity={entity} />;
  }
}

const EntityDetails = ({
  type,
  additionalHeaderContent,
  children,
}: PropsWithChildren<Props>) => {
  const { userName, modelName } = useParams();
  const modelsLoaded = useAppSelector(getModelListLoaded);
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const modelInfo = useSelector(getModelInfo(modelUUID));
  const applications = useSelector(getModelApplications(modelUUID));
  const { isNestedEntityPage } = useEntityDetailsParams();

  const [query, setQuery] = useQueryParams({
    panel: StringParam,
    entity: StringParam,
    activeView: withDefault(StringParam, "apps"),
  });
  const setActiveView = (view?: string) => {
    setQuery({ activeView: view });
  };

  const { panel: activePanel, entity, activeView } = query;
  const closePanelConfig = { panel: undefined, entity: undefined };

  const store = useStore();
  const storeState = store.getState();

  const [showWebCLI, setShowWebCLI] = useState(false);

  // In a JAAS environment the controllerUUID will be the sub controller not
  // the primary controller UUID that we connect to.
  const controllerUUID = modelInfo?.["controller-uuid"];
  // The primary controller data is the controller endpoint we actually connect
  // to. In the case of a normally bootstrapped controller this will be the
  // same as the model controller, however in a JAAS environment, this primary
  // controller will be JAAS and the model controller will be different.
  const primaryControllerData = useSelector(
    getControllerDataByUUID(controllerUUID)
  );

  let credentials = null;
  let controllerWSHost = "";
  let wsProtocol: string | null = null;
  if (primaryControllerData) {
    credentials = getUserPass(storeState, primaryControllerData[0]);
    controllerWSHost = primaryControllerData[0]
      .replace("ws://", "")
      .replace("wss://", "")
      .replace("/api", "");
    wsProtocol = primaryControllerData[0].split("://")[0];
  }

  const handleNavClick = (e: MouseEvent, section: string) => {
    e.preventDefault();
    (e.target as HTMLAnchorElement)?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
    setActiveView(section);
  };

  useEffect(() => {
    // Regex to extract the first two numbers:
    const versionRegex = /^\d+\.\d+/g;
    const version = Number(versionRegex.exec(modelInfo?.version ?? "")?.[0]);
    if (version >= 2.9) {
      // The Web CLI is only available in Juju controller versions 2.9 and
      // above. This will allow us to only show the shell on multi-controller
      // setups with different versions where the correct controller version
      // is available.
      setShowWebCLI(true);
    }
  }, [modelInfo]);

  useWindowTitle(modelInfo?.name ? `Model: ${modelInfo?.name}` : "...");

  const generateActivePanel = () => {
    if (activePanel === "config") {
      const charm = entity ? applications?.[entity]?.["charm-url"] : null;
      if (!entity || !charm) {
        return null;
      }
      return (
        <ConfigPanel
          appName={entity}
          charm={charm}
          modelUUID={modelUUID}
          onClose={() => setQuery(closePanelConfig)}
        />
      );
    } else if (activePanel === "remoteApps" || activePanel === "offers") {
      return (
        <SlidePanel
          isActive={activePanel}
          onClose={() => setQuery(closePanelConfig)}
          isLoading={!entity}
          className={`${activePanel}-panel`}
        >
          {entity ? generatePanelContent(activePanel, entity) : null}
        </SlidePanel>
      );
    }
  };

  const generateTabItems = () => {
    let items = [
      {
        active: activeView === "apps",
        label: "Applications",
        onClick: (e: MouseEvent) => handleNavClick(e, "apps"),
      },
      {
        active: activeView === "integrations",
        label: "Integrations",
        onClick: (e: MouseEvent) => handleNavClick(e, "integrations"),
      },
      {
        active: activeView === "action-logs",
        label: "Action Logs",
        onClick: (e: MouseEvent) => handleNavClick(e, "action-logs"),
      },
    ];

    if (modelInfo?.type !== "kubernetes") {
      items.push({
        active: activeView === "machines",
        label: "Machines",
        onClick: (e: MouseEvent) => handleNavClick(e, "machines"),
      });
    }

    return items;
  };

  let content: ReactNode;
  if (modelInfo) {
    content = (
      <FadeIn isActive={!!modelInfo}>
        <div
          className={classNames("l-content", {
            "l-content--has-webcli": showWebCLI,
          })}
        >
          <div className={`entity-details entity-details__${type}`}>
            <>
              {children}
              {generateActivePanel()}
            </>
          </div>
        </div>
      </FadeIn>
    );
  } else if (modelsLoaded && !modelUUID) {
    content = (
      <div className="p-strip">
        <div className="row">
          <NotFound message={Label.NOT_FOUND}>
            <>
              <p>
                Could not find a model named "{modelName}" for the user "
                {userName}
                ". If this is a model that belongs to another user then check
                that you have been{" "}
                <a href="https://juju.is/docs/olm/manage-users#heading--model-access">
                  granted access
                </a>
                .
              </p>
              <p>
                <Link to="/models">View all models</Link>
              </p>
            </>
          </NotFound>
        </div>
      </div>
    );
  } else {
    content = (
      <div className="entity-details__loading" data-testid="loading-spinner">
        <Spinner />
      </div>
    );
  }

  return (
    <BaseLayout>
      <Header>
        <div
          className={classNames("entity-details__header", {
            "entity-details__header--single-col": isNestedEntityPage,
          })}
        >
          <Breadcrumb />
          <div
            className="entity-details__view-selector"
            data-testid="view-selector"
          >
            {modelInfo && type === "model" && (
              <Tabs links={generateTabItems()} />
            )}
          </div>
          {additionalHeaderContent}
        </div>
      </Header>
      {content}
      {showWebCLI && (
        <WebCLI
          controllerWSHost={controllerWSHost}
          credentials={credentials}
          modelUUID={modelUUID}
          protocol={wsProtocol ?? "wss"}
        />
      )}
    </BaseLayout>
  );
};

export default EntityDetails;
