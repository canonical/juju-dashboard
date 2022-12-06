import { Link } from "react-router-dom";

import BaseLayout from "layout/BaseLayout/BaseLayout";
import NotFound from "components/NotFound/NotFound";

import useWindowTitle from "hooks/useWindowTitle";

export enum Label {
  NOT_FOUND = "Hmm, we can't seem to find that page...",
}

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
                  <Link to="/models">Models</Link>
                </li>
                <li>
                  <Link to="/controllers">Controllers</Link>
                </li>
                <li>
                  <Link to="/settings">Settings</Link>
                </li>
              </ul>
            </>
          </NotFound>
        </div>
      </div>
    </BaseLayout>
  );
}
