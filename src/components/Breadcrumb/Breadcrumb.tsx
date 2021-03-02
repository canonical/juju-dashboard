import { Link } from "@canonical/react-components";
import { useParams } from "react-router-dom";

import type { EntityDetailsRoute } from "components/Routes/Routes";

export default function Breadcrumb(): JSX.Element {
  const { userName, modelName, appName } = useParams<EntityDetailsRoute>();

  const generateModelURL = function (): string {
    if (userName) {
      return `/models/${userName}/${modelName}`;
    } else {
      return `/models/${modelName}`;
    }
  };

  return (
    <nav className="p-breadcrumbs" aria-label="Breadcrumb navigation">
      <ol className="p-breadcrumbs__items" data-test="breadcrumb-items">
        {appName ? (
          <>
            <li className="p-breadcrumbs__item" data-test="breadcrumb-model">
              <Link href={generateModelURL()}>{modelName}</Link>
            </li>
            <li className="p-breadcrumbs__item" data-test="breadcrumb-section">
              <Link href={generateModelURL()}>Applications</Link>
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
