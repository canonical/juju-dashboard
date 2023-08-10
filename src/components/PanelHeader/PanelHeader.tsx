import { type ReactNode } from "react";

type Props = {
  id: string;
  title: ReactNode;
  onRemovePanelQueryParams: () => void;
};

export default function PanelHeader({
  title,
  id,
  onRemovePanelQueryParams,
}: Props): JSX.Element {
  return (
    <div className="p-panel__header">
      <div className="p-panel__title" id={id}>
        <h5 className="u-no-margin">{title}</h5>
      </div>
      <div className="p-panel__controls">
        <button
          onClick={onRemovePanelQueryParams}
          className="p-button--base js-aside-close u-no-margin--bottom has-icon"
        >
          <i className="p-icon--close"></i>
        </button>
      </div>
    </div>
  );
}
