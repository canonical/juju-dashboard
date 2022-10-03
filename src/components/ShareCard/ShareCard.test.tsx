import { mount } from "enzyme";

import ShareCard from "./ShareCard";

describe("Share Card", () => {
  it("should display appropriate text", () => {
    const wrapper = mount(
      <ShareCard
        userName="janedoe"
        lastConnected="2021-06-03T16:03:15Z"
        access="read"
        isOwner={false}
        removeUser={jest.fn()}
        accessSelectChange={jest.fn()}
      />
    );
    expect(wrapper.find(".share-card__username").text()).toStrictEqual(
      "janedoe"
    );
    expect(wrapper.find(".share-card__secondary").text()).toStrictEqual(
      "Remove user"
    );
  });

  it("should not allow owners to change access", () => {
    const wrapper = mount(
      <ShareCard
        userName="janedoe"
        lastConnected="2021-06-03T16:03:15Z"
        access="read"
        isOwner={true}
        removeUser={jest.fn()}
        accessSelectChange={jest.fn()}
      />
    );
    expect(wrapper.find(".share-card__secondary").text()).toStrictEqual(
      "Owner"
    );
    expect(wrapper.find(".share__card-access").length).toBe(0);
  });

  it("should call remove function when icon clicked", () => {
    const removeUserFn = jest.fn();
    const accessSelectChangeFn = jest.fn();
    const wrapper = mount(
      <ShareCard
        userName="janedoe"
        lastConnected="2021-06-03T16:03:15Z"
        access="read"
        isOwner={false}
        removeUser={removeUserFn}
        accessSelectChange={accessSelectChangeFn}
      />
    );
    const removeIcon = wrapper.find(".p-icon--delete");
    removeIcon.simulate("click");
    expect(removeUserFn).toHaveBeenCalled();
  });

  it("should call access change function when select value clicked", () => {
    const removeUserFn = jest.fn();
    const accessSelectChangeFn = jest.fn();
    const wrapper = mount(
      <ShareCard
        userName="janedoe"
        lastConnected="2021-06-03T16:03:15Z"
        access="read"
        isOwner={false}
        removeUser={removeUserFn}
        accessSelectChange={accessSelectChangeFn}
      />
    );
    const accessLevelSelect = wrapper.find("select.share__card-access");
    accessLevelSelect.simulate("change", {
      target: { value: "write", name: "access" },
    });
    expect(accessSelectChangeFn).toHaveBeenCalled();
  });
});
