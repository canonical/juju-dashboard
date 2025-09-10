import { render } from "@testing-library/react";
import { vi } from "vitest";

import * as OptionsInputModule from "components/RadioInputBox/OptionInputs";
import { applicationCharmActionParamsFactory } from "testing/factories/juju/ActionV7";
import { charmActionSpecFactory } from "testing/factories/juju/Charms";

import type { ActionData } from "../types";

import ActionOptions from "./ActionOptions";

describe("ActionOptions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("generates a list of options from the provided data", () => {
    const OptionsInputSpy = vi.spyOn(OptionsInputModule, "default");
    const onValuesChange = vi.fn();
    const actionData = {
      "add-disk": charmActionSpecFactory.build({
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
      pause: charmActionSpecFactory.build({
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
      />,
    );

    const [[props]] = OptionsInputSpy.mock.calls;
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
