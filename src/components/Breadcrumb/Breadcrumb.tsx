import { Link, useParams } from "react-router-dom";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import React from "react";

import "./_breadcrumbs.scss";

export default function Breadcrumb(): JSX.Element {
  const {
    userName,
    modelName,
    appName,
    unitId,
    machineId,
  } = useParams<EntityDetailsRoute>();

  const generateBreadcrumbs = function (): JSX.Element {
    const view = machineId ? "machines" : "apps";
    const isNestedEntityPage = !!appName || !!unitId || !!machineId;
    if (isNestedEntityPage) {
      return (
        <>
          <li
            className="p-breadcrumbs__item u-no-padding--top"
            data-test="breadcrumb-model"
          >
            <Link to={`/models/${userName}/${modelName}`}>{modelName}</Link>
          </li>
          {!unitId && (
            <li
              className="p-breadcrumbs__item u-no-padding--top"
              data-test="breadcrumb-section"
            >
              <Link to={`/models/${userName}/${modelName}?activeView=${view}`}>
                {entityType.title}
              </Link>
            </li>
          )}
          {unitId && (
            <>
              <li
                className="p-breadcrumbs__item u-no-padding--top"
                data-test="breadcrumb-section"
              >
                <Link to={`/models/${userName}/${modelName}?activeView=apps`}>
                  Applications
                </Link>
              </li>
              <li
                className="p-breadcrumbs__item u-no-padding--top"
                data-test="breadcrumb-app"
              >
                <Link to={`/models/${userName}/${modelName}/${appName}`}>
                  {appName}
                </Link>
              </li>
            </>
          )}
          <li
            className="p-breadcrumbs__item u-no-padding--top"
            data-test={`breadcrumb-${entityType.title?.toLowerCase()}`}
          >
            <strong>{entityType.id}</strong>
          </li>
        </>
      );
    }
    return (
      <li
        className="p-breadcrumbs__item p-breadcrumbs__item--restricted"
        data-test="breadcrumb-model"
        title={modelName}
      >
        <Link to={`/models/${userName}/${modelName}`} className="p-link--soft">
          <strong>{modelName}</strong>
        </Link>
      </li>
    );
  };

  type EntityType = {
    id: string | undefined;
    title: string | undefined;
  };

  const entityType: EntityType = {
    id: undefined,
    title: undefined,
  };

  if (!!appName) {
    entityType.id = appName;
    entityType.title = "Applications";
  }

  if (!!unitId) {
    entityType.id = unitId;
    entityType.title = "Units";
  }

  if (!!machineId) {
    entityType.id = machineId;
    entityType.title = "Machines";
  }

  return (
    <nav className="p-breadcrumbs" aria-label="Breadcrumb navigation">
      <ol className="p-breadcrumbs__items" data-test="breadcrumb-items">
        {generateBreadcrumbs()}
      </ol>
    </nav>
  );
}
