import Aside from "components/Aside/Aside";
import PanelHeader from "components/PanelHeader/PanelHeader";

export default function ActionsPanel(): JSX.Element {
  const title = <div>0 3 units selected</div>;
  return (
    <Aside width="narrow">
      <div className="p-panel actions-panel">
        <PanelHeader title={title} />
      </div>
    </Aside>
  );
}
