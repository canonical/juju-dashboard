import { Icon } from "@canonical/react-components";
import { useMemo, type JSX } from "react";

import CredentialActions from "components/CredentialActions";
import DataTable from "components/DataTable";
import TruncatedTooltip from "components/TruncatedTooltip";
import {
  getCredentialContentsState,
  getFilteredCredentials,
  getUserCredentialsState,
} from "store/juju/selectors";
import type { Filters } from "store/juju/utils/models";
import { useAppSelector } from "store/store";

import { Status } from "./types";

type Props = {
  filters?: Filters;
};

const NO_FILTERS: Filters = {};

export default function CredentialsTable({
  filters = NO_FILTERS,
}: Props): JSX.Element {
  const credentialContents = useAppSelector(getCredentialContentsState);
  const userCredentials = useAppSelector(getUserCredentialsState);
  const credentials = useAppSelector((state) =>
    getFilteredCredentials(state, filters),
  );

  const column = useMemo(
    () => DataTable.columnBuilder<(typeof credentials)[number]>(),
    [],
  );

  return (
    <DataTable
      selectable={false}
      getKey={(row) => row.credential}
      groupBy="status"
      data={credentials}
      noRowsMessage={
        userCredentials.loading || credentialContents.loading
          ? "Loading credentials..."
          : "No credentials"
      }
      columns={{
        status: column({
          header: "Status",
          sortable: true,
          map: ({ contents }) =>
            contents?.result?.models?.length
              ? Status.IN_USE
              : Status.NOT_IN_USE,
          renderCell: (status) => (
            <TruncatedTooltip message={status}>
              <Icon
                name={
                  status === Status.IN_USE
                    ? "status-succeeded-small"
                    : "status-waiting-small"
                }
              />
              <span className="u-sh1">{status}</span>
            </TruncatedTooltip>
          ),
        }),
        name: column({
          header: "Name",
          sortable: true,
          map: ({ name }) => name,
          renderCell: (credentialName) => (
            <TruncatedTooltip message={credentialName}>
              {credentialName}
            </TruncatedTooltip>
          ),
        }),
        cloud: column({
          header: "Cloud",
          sortable: true,
          map: ({ cloud }) => cloud,
          renderCell: (cloudName) => (
            <TruncatedTooltip message={cloudName}>{cloudName}</TruncatedTooltip>
          ),
        }),
        authType: column({
          header: "Auth Type",
          sortable: true,
          map: ({ contents }) =>
            contents?.result?.content?.["auth-type"] ?? "-",
          renderCell: (authType) => (
            <TruncatedTooltip message={authType}>{authType}</TruncatedTooltip>
          ),
        }),
        models: column({
          header: "Models",
          map: ({ contents }) => contents?.result?.models?.length ?? 0,
        }),
        actions: column({
          header: "Actions",
          className: "actions u-align--right",
          collapse: true,
          map: () => <CredentialActions />,
        }),
      }}
    />
  );
}
