import { useLocation, Switch, Route } from "react-router-dom";

import RegisterController from "components/RegisterController/RegisterController";
import { AnimatePresence } from "framer-motion";

import "./_panels.scss";

export default function Panels() {
  const location = useLocation();
  return (
    <div className="panel-container">
      <Switch location={location} key={location.pathname}>
        <Route path="/controllers/register">
          <AnimatePresence>
            <RegisterController />
          </AnimatePresence>
        </Route>
      </Switch>
    </div>
  );
}
