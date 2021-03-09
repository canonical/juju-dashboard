import { useQueryParam, StringParam } from "use-query-params";

type Props = {
  title: JSX.Element;
};

export default function PanelHeader({ title }: Props): JSX.Element {
  const [panelQs, setPanelQs] = useQueryParam("panel", StringParam);

  return (
    <div className="p-panel__header">
      <h4 className="p-panel__title">{title}</h4>
      <div className="p-panel__controls">
        <button
          onClick={() => panelQs && setPanelQs(undefined)}
          className="p-button--base js-aside-close u-no-margin--bottom has-icon"
        >
          <i className="p-icon--close"></i>
        </button>
      </div>
    </div>
  );
}
