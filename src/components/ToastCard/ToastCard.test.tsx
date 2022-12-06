import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import cloneDeep from "clone-deep";

import ToastCard from "./ToastCard";

describe("Toast Card", () => {
  const toastInstanceExample = {
    createdAt: 1623162274616,
    duration: 5000,
    id: "2",
    message: "message",
    pauseDuration: 0,
    style: {},
    type: "custom",
    visible: true,
  };

  it("should display message", () => {
    const t = cloneDeep(toastInstanceExample);
    render(
      <ToastCard
        type="positive"
        text="I am a toast message"
        toastInstance={t}
      />
    );
    expect(screen.getByText("I am a toast message")).toHaveClass(
      "toast-card__message"
    );
  });

  it("should display as correct type", () => {
    const t = cloneDeep(toastInstanceExample);
    const { container } = render(
      <ToastCard
        type="positive"
        text="I am a toast message"
        toastInstance={t}
      />
    );
    expect(container.firstChild).toHaveAttribute("data-type", "positive");
  });

  it("should display correct success icon", () => {
    const t = cloneDeep(toastInstanceExample);
    render(
      <ToastCard
        type="positive"
        text="I am a toast message"
        toastInstance={t}
      />
    );
    expect(document.querySelector(".p-icon--success")).toBeInTheDocument();
  });

  it("should display correct error icon", () => {
    const t = cloneDeep(toastInstanceExample);
    render(
      <ToastCard
        type="negative"
        text="I am a toast message"
        toastInstance={t}
      />
    );
    expect(document.querySelector(".p-icon--error")).toBeInTheDocument();
  });

  it("should display close icon", () => {
    const t = cloneDeep(toastInstanceExample);
    render(
      <ToastCard
        type="negative"
        text="I am a toast message"
        toastInstance={t}
      />
    );
    expect(screen.getByRole("button", { name: "Close" })).toHaveClass(
      "p-icon--close"
    );
  });

  it("should not display an undo button if an undo function is not passed", () => {
    const t = cloneDeep(toastInstanceExample);
    render(
      <ToastCard
        type="negative"
        text="I am a toast message"
        toastInstance={t}
      />
    );
    expect(
      screen.queryByRole("button", { name: "Undo" })
    ).not.toBeInTheDocument();
  });

  it("should display a clickable undo button if an undo function is passed", async () => {
    const undoFn = jest.fn();
    const t = cloneDeep(toastInstanceExample);
    render(
      <ToastCard
        type="negative"
        text="I am a toast message"
        toastInstance={t}
        undo={undoFn}
      />
    );
    const undoButton = screen.getByRole("button", { name: "Undo" });
    expect(undoButton).toBeInTheDocument();
    await userEvent.click(undoButton);
    expect(undoFn).toHaveBeenCalled();
  });
});
