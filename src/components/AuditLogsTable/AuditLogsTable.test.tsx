import { renderComponent } from "testing/utils";

import AuditLogsTable from "./AuditLogsTable";

describe("AuditLogsTable", () => {
  it("should have table data", () => {
    renderComponent(<AuditLogsTable />);
    expect(document.querySelector("table tr")).toBeVisible();
  });
});
