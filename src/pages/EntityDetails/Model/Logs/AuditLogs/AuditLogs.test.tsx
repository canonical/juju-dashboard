import { renderComponent } from "testing/utils";

import AuditLogs from "./AuditLogs";

describe("Audit Logs", () => {
  it("should render the audit log correctly", async () => {
    renderComponent(<AuditLogs />);
    expect(
      document.querySelector(".entity-details__audit-logs")
    ).toBeInTheDocument();
  });
});
