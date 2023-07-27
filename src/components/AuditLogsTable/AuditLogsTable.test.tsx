import { renderComponent } from "testing/utils";

import AuditLogsTable from "./AuditLogsTable";

describe("AuditLogsTable", () => {
  it("should have model as second header when showing the model data", () => {
    renderComponent(<AuditLogsTable showModel={true} />);
    expect(document.querySelector("table tr")).toBeVisible();
    expect(document.querySelectorAll("table th")[1]).toHaveTextContent("model");
  });

  it("should not have model as header when not showing the model data", () => {
    renderComponent(<AuditLogsTable showModel={false} />);
    expect(document.querySelector("table tr")).toBeVisible();
    const headers = document.querySelectorAll("table th");
    headers.forEach((header) => {
      expect(header).not.toHaveTextContent("model");
    });
  });
});
