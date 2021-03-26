import { mount } from "enzyme";

import apiData from "testing/actions-list-api-response.json";

import ActionOptions from "./ActionOptions";

describe("ActionOptions", () => {
  it("generates a list of options from the provided data", () => {
    const actionData = apiData.response.results[0].actions;
    const onValuesChange = jest.fn();
    const wrapper = mount(
      <ActionOptions
        name="add-disk"
        data={actionData}
        onValuesChange={onValuesChange}
      />
    );

    const props = wrapper.find("OptionInputs").props();
    expect(props.name).toBe("add-disk");
    expect(props.options).toEqual([
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
    expect(typeof props.onValuesChange).toBe("function");
  });
});
