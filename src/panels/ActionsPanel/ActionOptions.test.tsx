import { render } from "@testing-library/react";
import apiData from "testing/actions-list-api-response.json";
import * as OptionsInputModule from "components/RadioInputBox/OptionInputs";

import ActionOptions from "./ActionOptions";

describe("ActionOptions", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("generates a list of options from the provided data", () => {
    const OptionsInputSpy = jest.spyOn(OptionsInputModule, "default");
    const actionData = apiData.response.results[0].actions;
    const onValuesChange = jest.fn();
    render(
      <ActionOptions
        name="add-disk"
        data={actionData}
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
