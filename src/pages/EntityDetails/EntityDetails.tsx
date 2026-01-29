import classNames from "classnames";
import type { FC, ReactNode } from "react";
import { useParams, Link, Outlet, useOutletContext } from "react-router";

import Breadcrumb from "components/Breadcrumb";
import LoadingSpinner from "components/LoadingSpinner";
import NotFound from "components/NotFound";
import type { EntityDetailsRoute } from "components/Routes";
import { useEntityDetailsParams, useStatusView } from "components/hooks";
import useCanConfigureModel from "hooks/useCanConfigureModel";
import useWindowTitle from "hooks/useWindowTitle";
import type { BaseLayoutContext } from "layout/BaseLayout";
import MainContent from "layout/MainContent";
import { StatusView } from "layout/Status";
import {
  getModelInfo,
  getModelListLoaded,
  getModelUUIDFromList,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";
import urls, { externalURLs } from "urls";

import ModelTabs from "./Model/ModelTabs";
import { Label, TestId } from "./types";

const getEntityType = (params: Partial<EntityDetailsRoute>): string => {
  if (params.unitId) {
    return "unit";
  } else if (params.machineId) {
    return "machine";
  } else if (params.appName) {
    return "app";
  }
  return "model";
};

const EntityDetails: FC = () => {
  const routeParams = useParams<EntityDetailsRoute>();
  const { userName, modelName } = routeParams;
  const modelsLoaded = useAppSelector(getModelListLoaded);
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, userName),
  );
  const modelInfo = useAppSelector((state) => getModelInfo(state, modelUUID));
  const { isNestedEntityPage } = useEntityDetailsParams();
  // Pass the base context to the children of the outlet in this component:
  const context = useOutletContext<BaseLayoutContext>();

  // Cleanup is set for this hook, but not for the instances of
  // useCanConfigureModel in other model components as this component wraps all
  // model routes so the model permissions are removed once the user navigates
  // away from the model.
  useCanConfigureModel(true);

  const entityType = getEntityType(routeParams);

  useWindowTitle(modelInfo?.name ? `Model: ${modelInfo?.name}` : "...");

  useStatusView(StatusView.CLI);

  let content: ReactNode = null;
  if (modelInfo) {
    content = (
      <div className={`entity-details entity-details__${entityType}`}>
        <Outlet context={context} />
      </div>
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
                <a href={externalURLs.modelAccess}>granted access</a>.
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
    content = <LoadingSpinner />;
  }

  return (
    <MainContent
      {...testId(TestId.COMPONENT)}
      title={
        <>
          <Breadcrumb />
          <div className="entity-details__view-selector">
            {modelInfo && entityType === "model" ? <ModelTabs /> : null}
          </div>
        </>
      }
      titleClassName={classNames("entity-details__header", {
        "entity-details__header--single-col": isNestedEntityPage,
      })}
      titleComponent="div"
    >
      {content}
    </MainContent>
  );
};

export default EntityDetails;
