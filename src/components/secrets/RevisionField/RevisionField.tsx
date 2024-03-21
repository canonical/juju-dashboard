import type {
  FormikFieldProps,
  PropsWithSpread,
  SelectProps,
} from "@canonical/react-components";
import { FormikField, Select } from "@canonical/react-components";

import { getSecretByURI } from "store/juju/selectors";
import { useAppSelector } from "store/store";

export enum Label {
  REVISION = "Revision",
}

type Props = PropsWithSpread<
  {
    modelUUID: string;
    secretURI: string;
  },
  Partial<FormikFieldProps> & Partial<SelectProps>
>;

const RevisionField = ({ modelUUID, secretURI, ...props }: Props) => {
  const secret = useAppSelector((state) =>
    getSecretByURI(state, modelUUID, secretURI),
  );
  return (
    <FormikField
      label={Label.REVISION}
      name="revision"
      component={Select}
      options={
        [...(secret?.revisions ?? [])].reverse().map(({ revision }) => ({
          label: `${revision}${revision === secret?.["latest-revision"] ? " (latest)" : ""}`,
          value: revision.toString(),
        })) ?? []
      }
      {...props}
    />
  );
};

export default RevisionField;
