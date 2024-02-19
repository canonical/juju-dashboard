import { ActionButton, Button } from "@canonical/react-components";
import { useId, useState, useRef } from "react";

import Panel from "components/Panel";
import SecretForm from "components/secrets/SecretForm";
import { usePanelQueryParams } from "panels/hooks";

export enum TestId {
  PANEL = "secret-form-panel",
}

export enum Label {
  CANCEL = "Cancel",
  SUBMIT_ADD = "Add secret",
  SUBMIT_UPDATE = "Update secret",
  TITLE_ADD = "Add a secret",
  TITLE_UPDATE = "Update secret",
}

type Props = {
  update?: boolean;
};

const SecretFormPanel = ({ update }: Props) => {
  const scrollArea = useRef<HTMLDivElement>(null);
  const formId = useId();
  const [queryParams, , handleRemovePanelQueryParams] = usePanelQueryParams<{
    panel: string | null;
    secret: string | null;
  }>({
    panel: null,
    secret: null,
  });
  const [saving, setSaving] = useState<boolean>(false);

  return (
    <>
      <Panel
        data-testid={TestId.PANEL}
        drawer={
          <>
            <Button onClick={handleRemovePanelQueryParams}>
              {Label.CANCEL}
            </Button>
            <ActionButton
              appearance="positive"
              disabled={saving}
              form={formId}
              loading={saving}
              type="submit"
            >
              {update ? Label.SUBMIT_UPDATE : Label.SUBMIT_ADD}
            </ActionButton>
          </>
        }
        onRemovePanelQueryParams={handleRemovePanelQueryParams}
        ref={scrollArea}
        title={update ? Label.TITLE_UPDATE : Label.TITLE_ADD}
        width="narrow"
      >
        <SecretForm
          formId={formId}
          onSuccess={() => handleRemovePanelQueryParams()}
          secretURI={queryParams.secret}
          setSaving={setSaving}
          update={update}
        />
      </Panel>
    </>
  );
};

export default SecretFormPanel;
