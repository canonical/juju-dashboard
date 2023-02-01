import { TSFixMe } from "@canonical/react-components";
import { render } from "@testing-library/react";
import * as OptionsInputModule from "components/RadioInputBox/OptionInputs";

import {
  applicationCharmActionFactory,
  applicationCharmActionParamsFactory,
} from "testing/factories/juju/ActionV7";

import ActionOptions from "./ActionOptions";
import { ActionData } from "./ActionsPanel";

describe("ActionOptions", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("generates a list of options from the provided data", () => {
    const OptionsInputSpy = jest.spyOn(OptionsInputModule, "default");
    const onValuesChange = jest.fn();
    // TSFixMe: The jujulib types for the actions are `AdditionalProperties`
    // while the component is more strongly typed.
    const actionData: TSFixMe = {
      "add-disk": applicationCharmActionFactory.build({
        params: applicationCharmActionParamsFactory.build({
          properties: {
            bucket: {
              description:
                "The name of the bucket in Ceph to add these devices into",
              type: "string",
            },
            "osd-devices": {
              description: "The devices to format and set up as osd volumes.",
              type: "string",
            },
          },
          required: ["osd-devices"],
          title: "add-disk",
          type: "object",
        }),
      }),
      pause: applicationCharmActionFactory.build({
        params: applicationCharmActionParamsFactory.build({
          title: "pause",
          type: "object",
        }),
      }),
    };
    render(
      <ActionOptions
        name="add-disk"
        data={actionData as ActionData}
        onValuesChange={onValuesChange}
      />
    );

    const props = OptionsInputSpy.mock.calls[0][0];
    expect(props.name).toBe("add-disk");
    expect(props.options).toStrictEqual([
      {
        name: "bucket",
        description: "The name of the bucket in Ceph to add these devices into",
        type: "string",
        required: false,
      },
      {
        name: "osd-devices",
        description: "The devices to format and set up as osd volumes.",
        type: "string",
        required: true,
      },
    ]);
    expect(props.onValuesChange).toBe(onValuesChange);
  });
});
