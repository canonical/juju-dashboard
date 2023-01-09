import { render, screen } from "@testing-library/react";

import ConfirmationModal from "./ConfirmationModal";

describe("ConfirmationModal", () => {
  it("displays supplied children", () => {
    const children = <div>I am a child, wahhh</div>;
    render(<ConfirmationModal buttonRow>{children}</ConfirmationModal>);
    expect(screen.getByText("I am a child, wahhh")).toBeInTheDocument();
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
    render(
      <ConfirmationModal buttonRow={buttonRow}>Content</ConfirmationModal>
    );
    expect(
      screen.getByRole("button", { name: "Continue editing" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Yes, I'm sure" })
    ).toBeInTheDocument();
  });
});
