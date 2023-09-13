import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { generalStateFactory, configFactory } from "testing/factories/general";
import {
  crossModelQueryApplicationFactory,
  crossModelQueryFactory,
} from "testing/factories/juju/jimm";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

import CodeSnippetBlock from "./CodeSnippetBlock";

// Handle clicking the toggle for a key that has an anchor wrapping the label.
const clickToggleForLink = async (name: string) => {
  // Get the parent element to click on instead of the anchor.
  const toggle = screen.getByRole("link", {
    name,
  }).parentElement;
  expect(toggle).toBeInTheDocument();
  if (toggle) {
    await userEvent.click(toggle);
  }
};

describe("CodeSnippetBlock", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build({
      general: generalStateFactory.build({
        controllerConnections: {
          "wss://controller.example.com": { controllerTag: "controller" },
        },
        config: configFactory.build({
          controllerAPIEndpoint: "wss://controller.example.com",
        }),
      }),
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

  it("should render correctly", () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{ abc123: [crossModelQueryFactory.withModel().build()] }}
      />,
      { state }
    );
    expect(screen.getByText("Mock Title")).toBeVisible();
    expect(document.querySelector(".p-code-snippet")).toBeVisible();
    expect(document.querySelector(".p-code-snippet__block")).toBeVisible();
  });

  it("should render the data in json format", async () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{ abc123: [crossModelQueryFactory.withModel().build()] }}
      />,
      { state }
    );
    const codeSnippetDropdownButton = screen.getByRole("combobox");
    expect(codeSnippetDropdownButton).toBeVisible();
    expect(
      screen.getByRole("option", { name: "Tree", hidden: true })
    ).toHaveAttribute("value", "tree");
    expect(
      screen.getByRole("option", { name: "JSON", hidden: true })
    ).toHaveAttribute("value", "json");
    await userEvent.selectOptions(codeSnippetDropdownButton, "JSON");
    expect(screen.getByText('"abc123"')).toBeVisible();
  });

  it("should render errors in tree format", async () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{ abc123: [crossModelQueryFactory.withModel().build()] }}
      />,
      { state }
    );
    const codeSnippetDropdownButton = screen.getByRole("combobox");
    await userEvent.selectOptions(codeSnippetDropdownButton, "Tree");
    expect(document.querySelector(".p-code-snippet__block")).toHaveTextContent(
      "▶eggman@external/test-model[] 1 item▶0:{} 1 key▶model:{} 8 keys"
    );
  });

  it("replace charms with links to charmhub", async () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{
          abc123: [
            crossModelQueryFactory.build({
              applications: {
                calico: crossModelQueryApplicationFactory.build({
                  charm: "cs:~calico",
                  "charm-channel": undefined,
                  "charm-name": "calico",
                  "charm-origin": "charmhub",
                }),
              },
            }),
          ],
        }}
      />,
      { state }
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "Tree");
    await clickToggleForLink("applications:");
    await clickToggleForLink("calico:");
    expect(screen.getByRole("link", { name: '"cs:~calico"' })).toHaveAttribute(
      "href",
      "https://charmhub.io/calico"
    );
  });

  it("replace charms with links to charmhub with channels", async () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{
          abc123: [
            crossModelQueryFactory.build({
              applications: {
                calico: crossModelQueryApplicationFactory.build({
                  charm: "cs:~calico",
                  "charm-channel": "stable",
                  "charm-name": "calico",
                  "charm-origin": "charmhub",
                }),
              },
            }),
          ],
        }}
      />,
      { state }
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "Tree");
    await clickToggleForLink("applications:");
    await clickToggleForLink("calico:");
    expect(screen.getByRole("link", { name: '"cs:~calico"' })).toHaveAttribute(
      "href",
      "https://charmhub.io/calico?channel=stable"
    );
  });

  it("should not replace charms with links from other stores", async () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{
          abc123: [
            crossModelQueryFactory.build({
              applications: {
                calico: crossModelQueryApplicationFactory.build({
                  charm: "cs:~calico",
                  "charm-name": "calico",
                  "charm-origin": "snapstore",
                }),
              },
            }),
          ],
        }}
      />,
      { state }
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "Tree");
    await clickToggleForLink("applications:");
    await clickToggleForLink("calico:");
    expect(
      screen.queryByRole("link", { name: '"cs:~calico"' })
    ).not.toBeInTheDocument();
  });

  it("should link units[unit-key] to unit in model details", async () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{
          abc123: [crossModelQueryFactory.withApplications().build()],
        }}
      />,
      { state }
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "Tree");
    await clickToggleForLink("applications:");
    await clickToggleForLink("application_0:");
    await userEvent.click(screen.getByText("units:"));
    expect(screen.getByRole("link", { name: "easyrsa/0:" })).toHaveAttribute(
      "href",
      urls.model.unit({
        userName: "eggman@external",
        modelName: "test-model",
        appName: "easyrsa",
        unitId: "0",
      })
    );
  });

  it("should link machines[machine-key] to machine in model details", async () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{
          abc123: [crossModelQueryFactory.withMachines().build()],
        }}
      />,
      { state }
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "Tree");
    await clickToggleForLink("machines:");
    expect(screen.getByRole("link", { name: "machine_0:" })).toHaveAttribute(
      "href",
      urls.model.machine({
        userName: "eggman@external",
        modelName: "test-model",
        machineId: "machine_0",
      })
    );
  });

  it("should link offers[app-key] to app in model details", async () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{
          abc123: [crossModelQueryFactory.withOffers().build()],
        }}
      />,
      { state }
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "Tree");
    await clickToggleForLink("offers:");
    expect(screen.getByRole("link", { name: "offer_0:" })).toHaveAttribute(
      "href",
      urls.model.app.index({
        userName: "eggman@external",
        modelName: "test-model",
        appName: "offer_0",
      })
    );
  });

  it("should link applications[app-key] to app in model details", async () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{
          abc123: [crossModelQueryFactory.withApplications().build()],
        }}
      />,
      { state }
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "Tree");
    await clickToggleForLink("applications:");
    expect(
      screen.getByRole("link", { name: "application_0:" })
    ).toHaveAttribute(
      "href",
      urls.model.app.index({
        userName: "eggman@external",
        modelName: "test-model",
        appName: "application_0",
      })
    );
  });

  it("should link units[unit-key].machine to machine in model details", async () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{
          abc123: [crossModelQueryFactory.withApplications().build()],
        }}
      />,
      { state }
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "Tree");
    await clickToggleForLink("applications:");
    await clickToggleForLink("application_0:");
    await userEvent.click(screen.getByText("units:"));
    await clickToggleForLink("easyrsa/0:");
    expect(screen.getByRole("link", { name: '"0/lxd/0"' })).toHaveAttribute(
      "href",
      urls.model.machine({
        userName: "eggman@external",
        modelName: "test-model",
        machineId: "0/lxd/0",
      })
    );
  });

  it("should link relations[key][app-key] to app in model details", async () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{
          abc123: [crossModelQueryFactory.withApplicationEndpoints().build()],
        }}
      />,
      { state }
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "Tree");
    await userEvent.click(screen.getByText("application-endpoints:"));
    await userEvent.click(screen.getByText("appEndpoint_0:"));
    await clickToggleForLink("relations:");
    await userEvent.click(screen.getByText("mysql:"));
    expect(screen.getByRole("link", { name: '"slurmdbd"' })).toHaveAttribute(
      "href",
      urls.model.app.index({
        userName: "eggman@external",
        modelName: "test-model",
        appName: "slurmdbd",
      })
    );
  });

  it("should link 'subordinate-to'[value] to app in model details", async () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{
          abc123: [crossModelQueryFactory.withApplications().build()],
        }}
      />,
      { state }
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "Tree");
    await clickToggleForLink("applications:");
    await clickToggleForLink("application_0:");
    await userEvent.click(screen.getByText("subordinate-to:"));
    expect(
      screen.getByRole("link", { name: '"kubernetes-control-plane"' })
    ).toHaveAttribute(
      "href",
      urls.model.app.index({
        userName: "eggman@external",
        modelName: "test-model",
        appName: "kubernetes-control-plane",
      })
    );
  });

  it("should link 'application-endpoints'[app-key].url to app in model details", async () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{
          abc123: [crossModelQueryFactory.withApplicationEndpoints().build()],
        }}
      />,
      { state }
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "Tree");
    await userEvent.click(screen.getByText("application-endpoints:"));
    await userEvent.click(screen.getByText("appEndpoint_0:"));
    expect(
      screen.getByRole("link", {
        name: '"jaas-staging:huwshimi@external/cmi-provider.mysql-cmi"',
      })
    ).toHaveAttribute(
      "href",
      urls.model.app.index({
        userName: "eggman@external",
        modelName: "test-model",
        appName: "appEndpoint_0",
      })
    );
  });
});
