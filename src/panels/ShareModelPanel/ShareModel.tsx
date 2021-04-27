import Aside from "components/Aside/Aside";
import PanelHeader from "components/PanelHeader/PanelHeader";

import "./share-model.scss";

export default function ShareModel() {
  return (
    <Aside>
      <div className="p-panel register-controller">
        <PanelHeader title={<h4>Share</h4>} />
        <div className="p-panel__content">
          <p>WAT</p>
        </div>
      </div>
    </Aside>
  );
}
