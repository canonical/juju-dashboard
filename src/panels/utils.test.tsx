import { render, screen } from "@testing-library/react";

import { generatePanelTableRows } from "./utils";

describe("generatePanelTableRows", () => {
  it("can render table rows", () => {
    render(
      <table>
        <tbody>
          {generatePanelTableRows([
            { th: "th1", td: "td1" },
            { th: "th2", td: "td2" },
          ])}
        </tbody>
      </table>,
    );
    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveTextContent("th1");
    expect(headers[1]).toHaveTextContent("th2");
    const cells = screen.getAllByRole("cell");
    expect(cells).toHaveLength(2);
    expect(cells[0]).toHaveTextContent("td1");
    expect(cells[1]).toHaveTextContent("td2");
  });
});
