import { screen, waitFor } from "@testing-library/react";

import * as juju from "juju/api";
import { getCharmsURLFromApplications } from "juju/api";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { applicationCharmActionParamsFactory } from "testing/factories/juju/ActionV7";
import {
  charmApplicationFactory,
  charmInfoFactory,
  charmActionSpecFactory,
} from "testing/factories/juju/Charms";
import {
  jujuStateFactory,
  modelDataFactory,
  modelDataInfoFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import CharmsAndActionsPanel from "./CharmsAndActionsPanel";

describe("CharmsAndActionsPanel", () => {
  let state: RootState;

  beforeEach(() => {
    jest.resetAllMocks();

    state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        charms: [
          charmInfoFactory.build({
            url: "ch:ceph",
            actions: {
              specs: {
                "add-disk": charmActionSpecFactory.build({
                  params: applicationCharmActionParamsFactory.build({
                    properties: {
                      bucket: {
                        type: "string",
                      },
                      "osd-devices": {
                        type: "string",
                      },
                    },
                    required: ["osd-devices"],
                    title: "add-disk",
                    type: "object",
                  }),
                }),
                pause: charmActionSpecFactory.build({
                  params: applicationCharmActionParamsFactory.build({
                    title: "pause",
                    type: "object",
                  }),
                }),
              },
            },
          }),
        ],
        modelData: {
          abc123: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              name: "group-test",
            }),
          }),
        },
        selectedApplications: [
          charmApplicationFactory.build({
            name: "ceph",
            "charm-url": "ch:ceph",
          }),
        ],
      }),
    });
  });

  it("should display the spinner before loading the panel", async () => {
    jest
      .spyOn(juju, "getCharmsURLFromApplications")
      .mockImplementation(() => Promise.resolve([]));
    const {
      result: { container },
    } = renderComponent(<CharmsAndActionsPanel />, { state });
    expect(
      container.querySelector(".l-aside")?.querySelector(".p-icon--spinner")
    ).toBeVisible();
    await waitFor(() => {
      expect(getCharmsURLFromApplications).toHaveBeenCalledTimes(1);
    });
  });

  it("should display the number of selected apps and units", async () => {
    jest
      .spyOn(juju, "getCharmsURLFromApplications")
      .mockImplementation(() => Promise.resolve(["ch:ceph"]));
    renderComponent(<CharmsAndActionsPanel />, { state });
    await waitFor(() => {
      expect(getCharmsURLFromApplications).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByRole("heading")).toHaveTextContent(
      "1 application (2 units) selected"
    );
  });

  it("should successfully handle no units selected", async () => {
    jest
      .spyOn(juju, "getCharmsURLFromApplications")
      .mockImplementation(() => Promise.resolve(["ch:ceph"]));
    state.juju.selectedApplications = [
      charmApplicationFactory.build({
        "charm-url": "ch:ceph",
        "unit-count": 0,
      }),
    ];
    renderComponent(<CharmsAndActionsPanel />, { state });
    await waitFor(() => {
      expect(getCharmsURLFromApplications).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByRole("heading")).toHaveTextContent(
      "1 application (0 units) selected"
    );
  });
});
