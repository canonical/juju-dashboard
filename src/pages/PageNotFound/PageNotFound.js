import { Link } from "react-router-dom";

import BaseLayout from "layout/BaseLayout/BaseLayout";
import Header from "components/Header/Header";
import NotFound from "components/NotFound/NotFound";

import useWindowTitle from "hooks/useWindowTitle";

export default function PageNotFound() {
  useWindowTitle("Page not found");
  return (
    <BaseLayout>
      <Header>
        <span style={{ marginLeft: "1rem" }}>404: Page not found</span>
      </Header>
      <div className="p-strip">
        <div className="row">
          <h2>¯\_(ツ)_/¯</h2>
          <h3>Hmm, we can't seem to find that page...</h3>
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
        </div>
      </div>
    </BaseLayout>
  );
}
