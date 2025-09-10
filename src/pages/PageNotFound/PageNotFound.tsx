import type { JSX } from "react";
import { Link } from "react-router";

import NotFound from "components/NotFound";
import useWindowTitle from "hooks/useWindowTitle";
import type { MainContentProps } from "layout/MainContent";
import MainContent from "layout/MainContent";
import urls from "urls";

import { Label } from "./types";

export default function PageNotFound(
  props: Partial<MainContentProps>,
): JSX.Element {
  useWindowTitle("404 - Page not found");
  return (
    <MainContent {...props}>
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
    </MainContent>
  );
}
