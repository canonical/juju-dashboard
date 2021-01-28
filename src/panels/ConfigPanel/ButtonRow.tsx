import { ReactElement } from "react";
import classnames from "classnames";

type Props = {
  enableSave: boolean;
  savingConfig: boolean;
  handleCancel: () => void;
  handleSubmit: () => void;
};

const buttonSets = {
  default: {
    cancel: "Cancel",
    save: "Save and apply",
  },
  cancel: {
    cancel: "Continue editing",
    save: "Yes, I'm sure",
  },
  apply: {
    cancel: "Cancel",
    save: "Yes, apply changes",
  },
};

export default function ButtonRow({
  enableSave,
  savingConfig,
  handleCancel,
  handleSubmit,
}: Props): ReactElement {
  return (
    <div className="config-panel__button-row">
      <button className="p-button--neutral" onClick={handleCancel}>
        Cancel
      </button>
      <button
        className={classnames("p-button--positive config-panel__save-button", {
          "is-active": savingConfig,
        })}
        onClick={handleSubmit}
        disabled={!enableSave}
      >
        {!savingConfig ? (
          "Save and apply"
        ) : (
          <>
            <i className="p-icon--spinner u-animation--spin is-light"></i>
            <span>Saving&hellip;</span>
          </>
        )}
      </button>
    </div>
  );
}
