import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  modelDataFactory,
  modelDataInfoFactory,
  controllerFactory,
} from "testing/factories/juju/juju";

import {
  getStatusValue,
  JAAS_CONTROLLER_UUID,
  generateAccessButton,
  Label,
  generateCloudCell,
} from "./shared";

describe("shared", () => {
  describe("getStatusValue", () => {
    it("can get a controller name", () => {
      const controllers = {
        "wss://test.com/api": [
          controllerFactory.build({
            uuid: "controller123",
            path: "default-controller",
          }),
        ],
      };
      const modelData = modelDataFactory.build({
        info: modelDataInfoFactory.build({
          "controller-uuid": "controller123",
        }),
      });
      expect(
        getStatusValue(modelData, "controllerName", controllers)
      ).toStrictEqual("default-controller");
    });

    it("can get the JAAS controller name", () => {
      const controllers = {
        "wss://test.com/api": [
          controllerFactory.build({ uuid: JAAS_CONTROLLER_UUID }),
        ],
      };
      const modelData = modelDataFactory.build({
        info: modelDataInfoFactory.build({
          "controller-uuid": JAAS_CONTROLLER_UUID,
        }),
      });
      expect(
        getStatusValue(modelData, "controllerName", controllers)
      ).toStrictEqual("JAAS");
    });

    it("handles an unknown controller name", () => {
      const controllers = {
        "wss://test.com/api": [
          controllerFactory.build({
            uuid: "something-else",
          }),
        ],
      };
      const modelData = modelDataFactory.build({
        info: modelDataInfoFactory.build({
          "controller-uuid": "controller123",
        }),
      });
      expect(
        getStatusValue(modelData, "controllerName", controllers)
      ).toStrictEqual("controller123");
    });
  });

  describe("generateCloudCell", () => {
    it("handles no provider", () => {
      render(
        generateCloudCell(
          modelDataFactory.build({
            info: undefined,
          })
        )
      );
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("can generate an AWS logo", () => {
      render(
        generateCloudCell(
          modelDataFactory.build({
            info: modelDataInfoFactory.build({
              "provider-type": "ec2",
            }),
          })
        )
      );
      expect(screen.getByRole("img")).toHaveAttribute("alt", "AWS logo");
    });

    it("can generate a GCE logo", () => {
      render(
        generateCloudCell(
          modelDataFactory.build({
            info: modelDataInfoFactory.build({
              "provider-type": "gce",
            }),
          })
        )
      );
      expect(screen.getByRole("img")).toHaveAttribute(
        "alt",
        "Google Cloud Platform logo"
      );
    });

    it("can generate an Azure logo", () => {
      render(
        generateCloudCell(
          modelDataFactory.build({
            info: modelDataInfoFactory.build({
              "provider-type": "azure",
            }),
          })
        )
      );
      expect(screen.getByRole("img")).toHaveAttribute("alt", "Azure logo");
    });

    it("can generate a Kubernetes logo", () => {
      render(
        generateCloudCell(
          modelDataFactory.build({
            info: modelDataInfoFactory.build({
              "provider-type": "kubernetes",
            }),
          })
        )
      );
      expect(screen.getByRole("img")).toHaveAttribute("alt", "Kubernetes logo");
    });
  });

  describe("generateAccessButton", () => {
    it("display an access button", () => {
      render(generateAccessButton(jest.fn(), "test-model"));
      expect(
        screen.getByRole("button", { name: Label.ACCESS_BUTTON })
      ).toBeInTheDocument();
    });

    it("can open the access panel", async () => {
      const setPanelQs = jest.fn();
      render(generateAccessButton(setPanelQs, "test-model"));
      await userEvent.click(
        screen.getByRole("button", { name: Label.ACCESS_BUTTON })
      );
      expect(setPanelQs).toHaveBeenCalledWith(
        {
          model: "test-model",
          panel: "share-model",
        },
        { replace: true }
      );
    });
  });
});
