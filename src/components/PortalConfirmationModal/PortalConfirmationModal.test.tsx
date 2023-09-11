import { render, screen } from "@testing-library/react";

import PortalConfirmationModal from "./PortalConfirmationModal";

describe("PortalConfirmationModal", () => {
  it("should render correctly", () => {
    render(
      <PortalConfirmationModal
        confirmButtonLabel="Confirm"
        onConfirm={jest.fn()}
      >
        Content
      </PortalConfirmationModal>
    );
    expect(screen.getByRole("dialog", { name: "" })).toHaveTextContent(
      "Content"
    );
    expect(screen.getByRole("dialog", { name: "" })).toContainElement(
      screen.getByRole("contentinfo", { name: "" })
    );
    expect(screen.getByRole("contentinfo", { name: "" })).toContainElement(
      screen.getByRole("button", { name: "Cancel" })
    );
    expect(screen.getByRole("contentinfo", { name: "" })).toContainElement(
      screen.getByRole("button", { name: "Confirm" })
    );
  });
});
