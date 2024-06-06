import { screen, within } from "@testing-library/react";

import { jujuStateFactory, rootStateFactory } from "testing/factories";
import {
  crossModelQueryApplicationFactory,
  crossModelQueryFactory,
} from "testing/factories/juju/jimm";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

import Value from "./Value";

describe("Value", () => {
  it("should display status", () => {
    renderComponent(
      <Value
        valueAsString='"active"'
        value="active"
        keyPath={["application-status", "current", 0, "abc123"]}
        code={{}}
      />,
    );
    expect(screen.getByText('"active"')).toBeInTheDocument();
  });

  it("should display date as tooltip with relative date", () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    renderComponent(
      <Value
        valueAsString={`"${date.toISOString()}"`}
        value={date.toISOString()}
        keyPath={["date", 0, "abc123"]}
        code={{}}
      />,
    );
    expect(
      within(screen.getByText(date.toISOString())).getByText("1 day ago", {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("should display link to charmhub", () => {
    renderComponent(
      <Value
        valueAsString='"cs:~calico"'
        value="cs:~calico"
        keyPath={["charm", "calico", "applications", 0, "abc123"]}
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
    );
    expect(screen.getByRole("link", { name: '"cs:~calico"' })).toHaveAttribute(
      "href",
      "https://charmhub.io/calico",
    );
  });

  it("should display link to charmhub with channels", () => {
    renderComponent(
      <Value
        valueAsString='"cs:~calico"'
        value="cs:~calico"
        keyPath={["charm", "calico", "applications", 0, "abc123"]}
        code={{
          abc123: [
            crossModelQueryFactory.build({
              applications: {
                calico: crossModelQueryApplicationFactory.build({
                  charm: "cs:~calico",
                  "charm-channel": "8.0/stable",
                  "charm-name": "calico",
                  "charm-origin": "charmhub",
                }),
              },
            }),
          ],
        }}
      />,
    );
    expect(screen.getByRole("link", { name: '"cs:~calico"' })).toHaveAttribute(
      "href",
      "https://charmhub.io/calico?channel=8.0/stable",
    );
  });

  it("should display linked units[unit-key].machine to machine", () => {
    const state = rootStateFactory.withGeneralConfig().build({
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

    renderComponent(
      <Value
        valueAsString='"0"'
        value="0"
        keyPath={["machine", "easyrsa/0", "units", 0, "abc123"]}
        code={{}}
      />,
      { state },
    );
    expect(screen.getByRole("link", { name: '"0"' })).toHaveAttribute(
      "href",
      urls.model.machine({
        userName: "eggman@external",
        modelName: "test-model",
        machineId: "0",
      }),
    );
  });

  it("should display linked relations[key][app-key] to app", () => {
    const state = rootStateFactory.withGeneralConfig().build({
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

    renderComponent(
      <Value
        valueAsString='"slurmdbd"'
        value="slurmdbd"
        keyPath={["mock-app-key", "mock-key", "relations", 0, "abc123"]}
        code={{}}
      />,
      { state },
    );
    expect(screen.getByRole("link", { name: '"slurmdbd"' })).toHaveAttribute(
      "href",
      urls.model.app.index({
        userName: "eggman@external",
        modelName: "test-model",
        appName: "slurmdbd",
      }),
    );
  });

  it("should display linked 'subordinate-to'[value] to app", () => {
    const state = rootStateFactory.withGeneralConfig().build({
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

    renderComponent(
      <Value
        valueAsString='"slurmdbd"'
        value="slurmdbd"
        keyPath={["mock-value", "subordinate-to", 0, "abc123"]}
        code={{}}
      />,
      { state },
    );
    expect(screen.getByRole("link", { name: '"slurmdbd"' })).toHaveAttribute(
      "href",
      urls.model.app.index({
        userName: "eggman@external",
        modelName: "test-model",
        appName: "slurmdbd",
      }),
    );
  });

  it("should display linked 'application-endpoints'[app-key].url to app", () => {
    const state = rootStateFactory.withGeneralConfig().build({
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

    renderComponent(
      <Value
        valueAsString='"http://mock-url.com"'
        value="http://mock-url.com"
        keyPath={[
          "url",
          "mock-app-key",
          "application-endpoints",
          "mock-app-key",
          "abc123",
        ]}
        code={{}}
      />,
      { state },
    );
    expect(
      screen.getByRole("link", { name: '"http://mock-url.com"' }),
    ).toHaveAttribute(
      "href",
      urls.model.app.index({
        userName: "eggman@external",
        modelName: "test-model",
        appName: "mock-app-key",
      }),
    );
  });

  it("should display the value as string in all other cases", () => {
    renderComponent(
      <Value
        valueAsString='"mock-value"'
        value="mock-value"
        keyPath={["mock-random-key", "abc123"]}
        code={{}}
      />,
    );
    expect(screen.getByText('"mock-value"')).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
