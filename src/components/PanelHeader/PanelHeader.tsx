import type { ReactNode } from "react";

type Props = {
  id: string;
  title: ReactNode;
  // TODO: Make onRemovePanelQueryParams required and modify tests.
  onRemovePanelQueryParams?: () => void;
};

export default function PanelHeader({
  title,
  id,
  onRemovePanelQueryParams,
}: Props): JSX.Element {
  return (
    <div className="p-panel__header">
      <div className="p-panel__title" id={id}>
        {title}
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
