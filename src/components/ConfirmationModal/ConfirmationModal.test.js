import { mount } from "enzyme";

import ConfirmationModal from "./ConfirmationModal";

describe("ConfirmationModal", () => {
  it("displays supplied children", () => {
    const children = <div>I am a child, wahhh</div>;
    const wrapper = mount(<ConfirmationModal>{children}</ConfirmationModal>);
    expect(wrapper.contains(children)).toBe(true);
  });

  it("renders the supplied button row content", () => {
    const buttonRow = [
      <button className="p-button--neutral" key="cancel" onClick={jest.fn()}>
        Continue editing
      </button>,
      <button className="p-button--negative" key="save" onClick={jest.fn()}>
        Yes, I'm sure
      </button>,
    ];
    const wrapper = mount(
      <ConfirmationModal buttonRow={buttonRow}>Content</ConfirmationModal>
    );
    expect(wrapper.contains(buttonRow)).toBe(true);
  });
});
