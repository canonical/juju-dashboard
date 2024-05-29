import { Link } from "react-router-dom";

import NotFound from "components/NotFound";
import useWindowTitle from "hooks/useWindowTitle";
import BaseLayout from "layout/BaseLayout";
import urls from "urls";

import { Label } from "./types";

export default function PageNotFound() {
  useWindowTitle("404 - Page not found");
  return (
    <BaseLayout>
      <div className="p-strip">
        <div className="row">
          <NotFound message={Label.NOT_FOUND}>
            <>
              <p>Are you looking for any of the pages below?</p>
              <ul>
                <li>
                  <Link to={urls.models.index}>Models</Link>
                </li>
                <li>
                  <Link to={urls.controllers}>Controllers</Link>
                </li>
              </ul>
            </>
          </NotFound>
        </div>
      </div>
    </BaseLayout>
  );
}
