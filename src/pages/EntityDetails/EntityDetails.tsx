import { Spinner, Tabs } from "@canonical/react-components";
import classNames from "classnames";
import type { ReactNode, MouseEvent } from "react";
import { useEffect, useState, useRef } from "react";
import { useSelector, useStore } from "react-redux";
import { useParams, Link, Outlet } from "react-router-dom";

import FadeIn from "animations/FadeIn";
import Breadcrumb from "components/Breadcrumb/Breadcrumb";
import Header from "components/Header/Header";
import NotFound from "components/NotFound/NotFound";
import type { EntityDetailsRoute } from "components/Routes/Routes";
import SearchBox from "components/SearchBox/SearchBox";
import WebCLI from "components/WebCLI/WebCLI";
import { useEntityDetailsParams } from "components/hooks";
import { useQueryParams } from "hooks/useQueryParams";
import useWindowTitle from "hooks/useWindowTitle";
import BaseLayout from "layout/BaseLayout/BaseLayout";
import { getUserPass } from "store/general/selectors";
import {
  getControllerDataByUUID,
  getModelInfo,
  getModelListLoaded,
  getModelUUIDFromList,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";
import urls from "urls";

import "./_entity-details.scss";

export enum Label {
  NOT_FOUND = "Model not found",
}

const getEntityType = (params: Partial<EntityDetailsRoute>) => {
  if (!!params.unitId) {
    return "unit";
  } else if (!!params.machineId) {
    return "machine";
  } else if (!!params.appName) {
    return "app";
  }
  return "model";
};

const EntityDetails = () => {
  const routeParams = useParams<EntityDetailsRoute>();
  const { userName, modelName } = routeParams;
  const modelsLoaded = useAppSelector(getModelListLoaded);
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const modelInfo = useSelector(getModelInfo(modelUUID));
  const { isNestedEntityPage } = useEntityDetailsParams();

  const [query, setQuery] = useQueryParams({
    panel: null,
    entity: null,
    activeView: "apps",
    filterQuery: "",
  });

  const { activeView } = query;

  const store = useStore();
  const storeState = store.getState();
  const searchBoxRef = useRef<HTMLInputElement>(null);

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
  const entityType = getEntityType(routeParams);

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

  const handleNavClick = (e: MouseEvent) => {
    (e.target as HTMLAnchorElement)?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
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

  useEffect(() => {
    // set value
    if (searchBoxRef.current) searchBoxRef.current.value = query.filterQuery;
  }, [query.filterQuery]);

  useWindowTitle(modelInfo?.name ? `Model: ${modelInfo?.name}` : "...");

  const generateTabItems = () => {
    if (!userName || !modelName) {
      return [];
    }
    const items = [
      {
        active: activeView === "apps",
        label: "Applications",
        onClick: (e: MouseEvent) => handleNavClick(e),
        to: urls.model.tab({ userName, modelName, tab: "apps" }),
        component: Link,
      },
      {
        active: activeView === "integrations",
        label: "Integrations",
        onClick: (e: MouseEvent) => handleNavClick(e),
        to: urls.model.tab({ userName, modelName, tab: "integrations" }),
        component: Link,
      },
      {
        active: activeView === "action-logs",
        label: "Action Logs",
        onClick: (e: MouseEvent) => handleNavClick(e),
        to: urls.model.tab({ userName, modelName, tab: "action-logs" }),
        component: Link,
      },
    ];

    if (modelInfo?.type !== "kubernetes") {
      items.push({
        active: activeView === "machines",
        label: "Machines",
        onClick: (e: MouseEvent) => handleNavClick(e),
        to: urls.model.tab({ userName, modelName, tab: "machines" }),
        component: Link,
      });
    }

    return items;
  };

  const generateSearch = () => {
    return (
      <SearchBox
        className="u-no-margin"
        placeholder="Filter applications"
        onKeyDown={(e) => {
          if (e.code === "Enter") handleFilterSubmit();
        }}
        onSearch={handleFilterSubmit}
        onClear={handleFilterSubmit}
        externallyControlled
        ref={searchBoxRef}
        data-testid="filter-applications"
      />
    );
  };

  const handleFilterSubmit = () => {
    const filterQuery = searchBoxRef.current?.value || "";
    setQuery({ filterQuery });
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
          <div className={`entity-details entity-details__${entityType}`}>
            <Outlet />
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
                <Link to={urls.models.index}>View all models</Link>
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
            {modelInfo && entityType === "model" && (
              <Tabs links={generateTabItems()} />
            )}
          </div>
          {activeView === "apps" && !isNestedEntityPage
            ? generateSearch()
            : null}
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
