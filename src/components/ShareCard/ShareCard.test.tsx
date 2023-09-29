import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ShareCard, { Label } from "./ShareCard";

describe("Share Card", () => {
  it("should display appropriate text", () => {
    render(
      <ShareCard
        userName="janedoe"
        lastConnected="2021-06-03T16:03:15Z"
        access="read"
        isOwner={false}
        removeUser={jest.fn()}
        accessSelectChange={jest.fn()}
      />
    );
    expect(screen.getAllByText("janedoe")[0]).toHaveClass(
      "share-card__username"
    );
    const remove = screen.getByRole("button", { name: Label.REMOVE });
    expect(remove).toBeInTheDocument();
  });

  it("should not allow owners to change access", () => {
    render(
      <ShareCard
        userName="janedoe"
        lastConnected="2021-06-03T16:03:15Z"
        access="read"
        isOwner={true}
        removeUser={jest.fn()}
        accessSelectChange={jest.fn()}
      />
    );
    expect(screen.getByText(Label.OWNER)).toHaveClass("share-card__secondary");
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText(Label.REMOVE)).not.toBeInTheDocument();
  });

  it("should call remove function when icon clicked", async () => {
    const removeUserFn = jest.fn();
    const accessSelectChangeFn = jest.fn();
    render(
      <ShareCard
        userName="janedoe"
        lastConnected="2021-06-03T16:03:15Z"
        access="read"
        isOwner={false}
        removeUser={removeUserFn}
        accessSelectChange={accessSelectChangeFn}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: Label.REMOVE }));
    expect(removeUserFn).toHaveBeenCalled();
  });

  it("should call access change function when select value clicked", async () => {
    const removeUserFn = jest.fn();
    const accessSelectChangeFn = jest.fn(() => Promise.resolve(null));
    render(
      <ShareCard
        userName="janedoe"
        lastConnected="2021-06-03T16:03:15Z"
        access="read"
        isOwner={false}
        removeUser={removeUserFn}
        accessSelectChange={accessSelectChangeFn}
      />
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "write");
    expect(accessSelectChangeFn).toHaveBeenCalled();
  });
});
