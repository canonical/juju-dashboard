import { screen } from "@testing-library/react";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  generalStateFactory,
  configFactory,
  controllerFeaturesStateFactory,
  controllerFeaturesFactory,
} from "testing/factories/general";
import { renderComponent } from "testing/utils";

import AdvancedSearch from "./AdvancedSearch";

describe("AdvancedSearch", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://controller.example.com",
          isJuju: false,
        }),
        controllerFeatures: controllerFeaturesStateFactory.build({
          "wss://controller.example.com": controllerFeaturesFactory.build({
            crossModelQueries: true,
          }),
        }),
      }),
    });
  });
  it("should render the page", () => {
    renderComponent(<AdvancedSearch />, { state });
    expect(document.querySelector("header")).toHaveTextContent(
      "Advanced search"
    );
  });

  it("should display the search form", () => {
    renderComponent(<AdvancedSearch />, { state });
    expect(screen.getByTestId("search-form")).toBeInTheDocument();
  });
});
