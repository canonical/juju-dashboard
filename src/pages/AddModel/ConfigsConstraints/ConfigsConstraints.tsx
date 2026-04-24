import { List, RadioInput } from "@canonical/react-components";
import { useFormikContext } from "formik";
import type { JSX } from "react";

import { testId } from "testing/utils";
import { externalURLs } from "urls";

import { DISABLED_COMMAND_OPTIONS } from "./disabledCommandOptions";
import { type FormFields, Label, TestId } from "./types";

const ConfigsConstraints = (): JSX.Element => {
  const { values, setFieldValue } = useFormikContext<
    FormFields & Record<string, string>
  >();

  return (
    <div {...testId(TestId.CONFIGS_CONSTRAINTS_FORM)}>
      <h5 className="u-no-padding--top u-no-margin--bottom">
        {Label.DISABLED_COMMANDS}
      </h5>
      <p className="u-no-margin--bottom p-text--small">
        <a href={externalURLs.disableCommand}>{Label.DISABLE_COMMANDS_DOCS}</a>
      </p>
      <List
        items={DISABLED_COMMAND_OPTIONS.map(
          ({ label, value, description, disabledCommands }) => (
            <div className="disabled-commands__option" key={value}>
              <RadioInput
                checked={values.disabledCommands === value}
                name="disableCommands"
                label={label}
                onChange={() => {
                  void setFieldValue("disabledCommands", value);
                }}
                value={value}
              />
              <div className="p-text--small u-no-margin--bottom">
                {description}
                {disabledCommands && disabledCommands.length > 0 ? (
                  <div>
                    <b>Disables commands:</b> {disabledCommands.join(", ")}
                  </div>
                ) : null}
              </div>
            </div>
          ),
        )}
        divided
      />
    </div>
  );
};

export default ConfigsConstraints;
