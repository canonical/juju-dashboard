import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ShareCard from "./ShareCard";

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
    expect(screen.getByText("janedoe")).toHaveClass("share-card__username");
    expect(
      screen.getByRole("button", { name: "Remove user" })
    ).toBeInTheDocument();
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
    expect(screen.getByText("Owner")).toHaveClass("share-card__secondary");
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
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
    await userEvent.click(screen.getByRole("button", { name: "Remove user" }));
    expect(removeUserFn).toHaveBeenCalled();
  });

  it("should call access change function when select value clicked", async () => {
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
    await userEvent.selectOptions(screen.getByRole("combobox"), "write");
    expect(accessSelectChangeFn).toHaveBeenCalled();
  });
});
