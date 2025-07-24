import { Button, FormikField, Icon } from "@canonical/react-components";
import { FieldArray, Form, Formik } from "formik";

import { ENABLED_FLAGS } from "consts";
import useLocalStorage from "hooks/useLocalStorage";

import { StatusTitle } from "./StatusTitle";
import type { Widget } from "./types";
import { sendToast } from "./utils";

export default {
  Title: () => {
    const [enabledFlags] = useLocalStorage<string[]>(ENABLED_FLAGS, []);

    return (
      <StatusTitle
        title="Feature flags"
        label={
          // TODO: This won't get updated without a refresh, since it's just pulling from local storage.
          `${enabledFlags.length} enabled`
        }
      />
    );
  },
  Widget: () => {
    const [enabledFlags, setEnabledFlags] = useLocalStorage<string[]>(
      ENABLED_FLAGS,
      [],
    );

    function saveFlags({ enabledFlags }: { enabledFlags: string[] }) {
      setEnabledFlags(enabledFlags);
      sendToast("Feature flags saved to local storage.");
    }

    return (
      <>
        <Formik initialValues={{ enabledFlags }} onSubmit={saveFlags}>
          {({ values }) => (
            <Form>
              <FieldArray
                name="enabledFlags"
                render={(arrayHelpers) => (
                  <>
                    {values.enabledFlags.map((flag, index) => (
                      <div key={index} className="dev-bar__feature-flags__flag">
                        <Button
                          hasIcon
                          onClick={() => arrayHelpers.remove(index)}
                          type="button"
                        >
                          <Icon name="delete" />
                        </Button>

                        <FormikField
                          name={`enabledFlags.${index}`}
                          type="text"
                        />
                      </div>
                    ))}

                    <div className="dev-bar__form-controls">
                      <Button
                        hasIcon
                        onClick={() => arrayHelpers.push("")}
                        type="button"
                      >
                        <Icon name="plus" />
                        <span>Add Flag</span>
                      </Button>

                      <Button type="submit">Save</Button>
                    </div>
                  </>
                )}
              />
            </Form>
          )}
        </Formik>
      </>
    );
  },
} satisfies Widget;
