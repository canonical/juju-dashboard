import { Link } from "@canonical/react-components";
import { useParams } from "react-router-dom";

import type { EntityDetailsRoute } from "components/Routes/Routes";

export default function Breadcrumb(): JSX.Element {
  const { userName, modelName, appName } = useParams<EntityDetailsRoute>();

  return (
    <nav className="p-breadcrumbs" aria-label="Breadcrumb navigation">
      <ol className="p-breadcrumbs__items" data-test="breadcrumb-items">
        {appName ? (
          <>
            <li className="p-breadcrumbs__item" data-test="breadcrumb-model">
              <Link
                href={`/models/${
                  userName ? `${userName}/${modelName}` : `${modelName}`
                }`}
              >
                {modelName}
              </Link>
            </li>
            <li className="p-breadcrumbs__item" data-test="breadcrumb-section">
              <Link
                href={`/models/${
                  userName ? `${userName}/${modelName}` : `${modelName}`
                }`}
              >
                Applications
              </Link>
            </li>
            <li
              className="p-breadcrumbs__item"
              data-test="breadcrumb-application"
            >
              <strong>{appName}</strong>
            </li>
          </>
        ) : (
          <li className="p-breadcrumbs__item" data-test="breadcrumb-model">
            <strong>{modelName}</strong>
          </li>
        )}
      </ol>
    </nav>
  );
}
