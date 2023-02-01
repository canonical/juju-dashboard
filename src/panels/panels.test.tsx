import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";

import { rootStateFactory } from "testing/factories/root";

import Panels, { close } from "./panels";

const mockStore = configureStore([]);

describe("Panels", () => {
  it("should call close function when escape key is pressed", () => {
    const outerNode = document.createElement("div");
    const store = mockStore(rootStateFactory.build());
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/foo"]}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Panels />
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>,
      {
        container: document.body.appendChild(outerNode),
      }
    );
    outerNode.dispatchEvent(
      new KeyboardEvent("keydown", { code: "Enter", bubbles: true })
    );

    const closeSpy = jest.spyOn(close, "onEscape");

    outerNode.dispatchEvent(
      new KeyboardEvent("keydown", { code: "Escape", bubbles: true })
    );
    expect(closeSpy).toHaveBeenCalled();
  });
});
