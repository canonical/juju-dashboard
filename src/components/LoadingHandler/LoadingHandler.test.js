import { mount } from "enzyme";

import { Spinner } from "@canonical/react-components";
import LoadingHandler from "./LoadingHandler";

describe("LoadingHandler", () => {
  it("returns a spinner if no data and set to loading", () => {
    const wrapper = mount(<LoadingHandler hasData={false} loading={true} />);
    expect(wrapper.contains(<Spinner />)).toBe(true);
  });

  it("returns a message if no data and not loading", () => {
    const message = "No data provided";
    const wrapper = mount(
      <LoadingHandler hasData={false} loading={false} noDataMessage={message} />
    );
    expect(wrapper.text()).toBe(message);
  });

  it("returns the children if data and not loading", () => {
    const children = <div>I am a child, wahhhh</div>;
    const wrapper = mount(
      <LoadingHandler hasData={true} loading={false}>
        {children}
      </LoadingHandler>
    );
    expect(wrapper.contains(children)).toBe(true);
  });
});
