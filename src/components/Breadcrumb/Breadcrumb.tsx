import type { JSX, ReactNode } from "react";
import { Link } from "react-router";

import ModelActions from "components/ModelActions";
import { useEntityDetailsParams } from "components/hooks";
import { getModelUUIDFromList } from "store/juju/selectors";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";
import urls from "urls";
import { ModelTab } from "urls";

import { TestId } from "./types";

export default function Breadcrumb(): JSX.Element {
  const {
    qualifier,
    modelName,
    appName,
    unitId,
    machineId,
    isNestedEntityPage,
  } = useEntityDetailsParams();
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, qualifier),
  );

  const generateBreadcrumbs = function (): ReactNode {
    const view = machineId ? ModelTab.MACHINES : ModelTab.APPS;
    if (!qualifier || !modelName) {
      return null;
    }

    type EntityType = {
      id: string | undefined;
      title: string | undefined;
    };

    const entityType: EntityType = {
      id: undefined,
      title: undefined,
    };

    if (appName) {
      entityType.id = appName;
      entityType.title = "Applications";
    }

    if (unitId) {
      entityType.id = unitId;
      entityType.title = "Units";
    }

    if (machineId) {
      entityType.id = machineId;
      entityType.title = "Machines";
    }

    if (isNestedEntityPage) {
      return (
        <>
          <li
            className="p-breadcrumbs__item u-no-padding--top"
            {...testId(TestId.MODEL)}
          >
            <Link to={urls.model.index({ qualifier, modelName })}>
              {modelName}
            </Link>
          </li>
          {!unitId && (
            <li
              className="p-breadcrumbs__item u-no-padding--top"
              {...testId(TestId.SECTION)}
            >
              <Link to={urls.model.tab({ qualifier, modelName, tab: view })}>
                {entityType.title}
              </Link>
            </li>
          )}
          {unitId && (
            <>
              <li
                className="p-breadcrumbs__item u-no-padding--top"
                {...testId(TestId.SECTION)}
              >
                <Link
                  to={urls.model.tab({
                    qualifier,
                    modelName,
                    tab: ModelTab.APPS,
                  })}
                >
                  Applications
                </Link>
              </li>
              <li
                className="p-breadcrumbs__item u-no-padding--top"
                {...testId(TestId.APP)}
              >
                {appName ? (
                  <Link
                    to={urls.model.app.index({ qualifier, modelName, appName })}
                  >
                    {appName}
                  </Link>
                ) : null}
              </li>
            </>
          )}
          <li
            className="p-breadcrumbs__item u-no-padding--top"
            {...testId(`breadcrumb-${entityType.title?.toLowerCase()}`)}
          >
            <strong>{entityType.id}</strong>
          </li>
        </>
      );
    }
    return (
      <li
        className="p-breadcrumbs__item p-breadcrumbs__item--restricted"
        {...testId(TestId.MODEL)}
        title={modelName}
      >
        <Link
          to={urls.model.index({ qualifier, modelName })}
          className="p-link--soft p-breadcrumbs__model-name"
        >
          <strong>{modelName}</strong>
        </Link>
        <ModelActions
          modelUUID={modelUUID}
          modelName={modelName}
          redirectOnDestroy
          position="left"
        />
      </li>
    );
  };

  return (
    <nav className="p-breadcrumbs" aria-label="Breadcrumb navigation">
      <ol className="p-breadcrumbs__items" {...testId(TestId.ITEMS)}>
        {generateBreadcrumbs()}
      </ol>
    </nav>
  );
}
