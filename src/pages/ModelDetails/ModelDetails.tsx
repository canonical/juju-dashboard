import type { JSX } from "react";
import { Route, Routes } from "react-router";

import EntityDetails from "pages/EntityDetails";
import App from "pages/EntityDetails/App";
import Machine from "pages/EntityDetails/Machine";
import Model from "pages/EntityDetails/Model";
import Unit from "pages/EntityDetails/Unit";
import urls from "urls";

export default function ModelDetails(): JSX.Element {
  const detailsRoute = urls.model.index(null);
  return (
    <Routes>
      <Route path="*" element={<EntityDetails />}>
        <Route path="" element={<Model />} />
        <Route
          path={urls.model.app.index(null, detailsRoute)}
          element={<App />}
        />
        <Route path={urls.model.unit(null, detailsRoute)} element={<Unit />} />
        <Route
          path={urls.model.machine(null, detailsRoute)}
          element={<Machine />}
        />
      </Route>
    </Routes>
  );
}
