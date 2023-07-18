import { renderComponent } from "testing/utils";

import Logs from "./Logs";

describe("Model", () => {
  it("can display the action logs tab", async () => {
    renderComponent(<Logs />, {
      url: "/models/eggman@external/test1?activeView=action-logs",
      path: "/models/:userName/:modelName",
    });

    expect(
      document.querySelector(".entity-details__action-logs")
    ).toBeInTheDocument();
  });
});
