import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { rootStateFactory, jujuStateFactory } from "testing/factories";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import ResultsModelLink from "./ResultsModelLink";

describe("ResultsModelLink", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build({
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "test-model",
            ownerTag: "user-eggman@external",
          }),
        },
      }),
    });
  });

  it("should not propagate clicks", async () => {
    const onClick = jest.fn();
    renderComponent(
      <button onClick={onClick}>
        <ResultsModelLink uuid="abc123">abc123</ResultsModelLink>
      </button>,
      { state }
    );
    await userEvent.click(screen.getByRole("link", { name: "abc123:" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
