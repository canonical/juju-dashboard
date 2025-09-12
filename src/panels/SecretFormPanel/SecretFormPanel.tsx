import { ActionButton, Button } from "@canonical/react-components";
import type { FC } from "react";
import { useId, useState, useRef } from "react";

import Panel from "components/Panel";
import SecretForm from "components/secrets/SecretForm";
import { usePanelQueryParams } from "panels/hooks";

import { Label, TestId } from "./types";

type Props = {
  update?: boolean;
};

const SecretFormPanel: FC<Props> = ({ update = false }: Props) => {
  const scrollArea = useRef<HTMLDivElement>(null);
  const formId = useId();
  const [queryParams, , handleRemovePanelQueryParams] = usePanelQueryParams<{
    panel: null | string;
    secret: null | string;
  }>({
    panel: null,
    secret: null,
  });
  const [saving, setSaving] = useState<boolean>(false);

  return (
    <Panel
      data-testid={TestId.PANEL}
      drawer={
        <>
          <Button onClick={handleRemovePanelQueryParams}>{Label.CANCEL}</Button>
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
        onSuccess={() => {
          handleRemovePanelQueryParams();
        }}
        secretURI={queryParams.secret}
        setSaving={setSaving}
        update={update}
      />
    </Panel>
  );
};

export default SecretFormPanel;
