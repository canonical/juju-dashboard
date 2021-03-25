import { mount } from "enzyme";

import Spinner from "@canonical/react-components/dist/components/Spinner/Spinner";
import LoadingHandler from "./LoadingHandler";

describe("LoadingHandler", () => {
  it("returns a spinner if no data and set to loading", () => {
    const wrapper = mount(<LoadingHandler data={null} loading={true} />);
    expect(wrapper.contains(<Spinner />)).toBe(true);
  });

  it("returns a message if no data and not loading", () => {
    const message = "No data provided";
    const wrapper = mount(
      <LoadingHandler data={null} loading={false} noDataMessage={message} />
    );
    expect(wrapper.text()).toBe(message);
  });

  it("returns the children if data and not loading", () => {
    const children = <div>I am a child, wahhhh</div>;
    const wrapper = mount(
      <LoadingHandler data={true} loading={false}>
        {children}
      </LoadingHandler>
    );
    expect(wrapper.contains(children)).toBe(true);
  });
});
