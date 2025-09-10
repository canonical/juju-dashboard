import type {
  FormikFieldProps,
  PropsWithSpread,
  SelectProps,
} from "@canonical/react-components";
import { FormikField, Select } from "@canonical/react-components";
import type { FC } from "react";

import { getSecretByURI, getSecretLatestRevision } from "store/juju/selectors";
import { useAppSelector } from "store/store";

import { Label } from "./types";

type Props = PropsWithSpread<
  {
    modelUUID: string;
    secretURI: string;
  },
  Partial<FormikFieldProps> & Partial<SelectProps>
>;

const RevisionField: FC<Props> = ({
  modelUUID,
  secretURI,
  ...props
}: Props) => {
  const secret = useAppSelector((state) =>
    getSecretByURI(state, modelUUID, secretURI),
  );
  const latestRevision = useAppSelector((state) =>
    getSecretLatestRevision(state, modelUUID, secretURI),
  );
  return (
    <FormikField
      label={Label.REVISION}
      name="revision"
      component={Select}
      options={
        [...(secret?.revisions ?? [])].reverse().map(({ revision }) => ({
          label: `${revision}${revision === latestRevision ? " (latest)" : ""}`,
          value: revision.toString(),
        })) ?? []
      }
      {...props}
    />
  );
};

export default RevisionField;
