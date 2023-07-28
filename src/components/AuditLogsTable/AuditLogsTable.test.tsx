import { renderComponent } from "testing/utils";

import AuditLogsTable from "./AuditLogsTable";

describe("AuditLogsTable", () => {
  it("should have model as second header when showing the model data", () => {
    renderComponent(<AuditLogsTable showModel={true} />);
    expect(document.querySelector("table tr")).toBeVisible();
    expect(document.querySelectorAll("table th")[1]).toHaveTextContent("model");
  });

  it("should not have model as header when showModel param is not passed", () => {
    renderComponent(<AuditLogsTable />);
    expect(document.querySelector("table tr")).toBeVisible();
    const headers = document.querySelectorAll("table th");
    headers.forEach((header) => {
      expect(header).not.toHaveTextContent("model");
    });
  });

  it("should not have model as header when not showing the model data", () => {
    renderComponent(<AuditLogsTable showModel={false} />);
    expect(document.querySelector("table tr")).toBeVisible();
    const headers = document.querySelectorAll("table th");
    headers.forEach((header) => {
      expect(header).not.toHaveTextContent("model");
    });
  });

  it("should contain all headers", () => {
    renderComponent(<AuditLogsTable showModel={true} />);
    const columnHeaders = document.querySelectorAll("table th");
    expect(columnHeaders[0]).toHaveTextContent("user");
    expect(columnHeaders[1]).toHaveTextContent("model");
    expect(columnHeaders[2]).toHaveTextContent("time");
    expect(columnHeaders[3]).toHaveTextContent("facade name");
    expect(columnHeaders[4]).toHaveTextContent("facade method");
    expect(columnHeaders[5]).toHaveTextContent("facade version");
  });
});
