import { screen } from "@testing-library/react";

import { renderComponent } from "testing/utils";

import AuditLogs from "./AuditLogs";

describe("Audit Logs", () => {
  it("should render the audit log correctly", async () => {
    renderComponent(<AuditLogs />);
    const content = screen.getByText("Audit Logs Placeholder");
    expect(content).toBeInTheDocument();
  });
});
