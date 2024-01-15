import type { SetParams } from "hooks/useQueryParams";

export enum Label {
  ACCESS_BUTTON = "Access",
}

type Props = {
  modelName: string;
  setPanelQs: SetParams<Record<string, unknown>>;
};

const AccessButton = ({ modelName, setPanelQs }: Props) => {
  return (
    <button
      onClick={(event) => {
        event.stopPropagation();
        setPanelQs(
          {
            model: modelName,
            panel: "share-model",
          },
          { replace: true },
        );
      }}
      className="model-access p-button--neutral is-dense"
    >
      {Label.ACCESS_BUTTON}
    </button>
  );
};

export default AccessButton;
