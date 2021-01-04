import "./_config-panel.scss";

export default function ConfigPanel() {
  const configSelected = false;
  return (
    <div className="config-panel">
      <div className="row">
        <div className="config-panel__config-list col-6">
          <div className="config-panel__list-header">Icon Mysql</div>
        </div>
        <div className="config-panel__description col-6">
          {configSelected ? (
            <h4>Configuration Description</h4>
          ) : (
            <div className="config-panel__no-description u-vertically-center">
              <div>
                Click on a configuration row to view its related description and
                parameters
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
