import { Button } from "@canonical/react-components";

import { useQueryParams } from "hooks/useQueryParams";

import type { Props } from "./types";

const MigrateButton = ({ modelName, ...props }: Props) => {
  const [, setPanelQs] = useQueryParams<{
    model: string | null;
    panel: string | null;
  }>({
    model: null,
    panel: null,
  });

  return (
    <Button
      {...props}
      onClick={(event) => {
        event.stopPropagation();
        setPanelQs(
          {
            model: modelName,
            panel: "migrate-model",
          },
          { replace: true },
        );
      }}
    >
      Migrate
    </Button>
  );
};

export default MigrateButton;
