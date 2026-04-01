import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";
import { vi } from "vitest";

import type { AddModelFormState } from "pages/AddModel/types";
import type { CloudState } from "store/juju/types";
import { renderComponent } from "testing/utils";

import Fields from "./Fields";

describe("Fields", () => {
  const cloudInfo: CloudState["clouds"] = {
    "cloud-aws": {
      regions: [{ name: "us-east-1" }, { name: "us-west-2" }],
      type: "ec2",
    },
    "cloud-gce": {
      regions: [{ name: "europe-west1" }],
      type: "gce",
    },
  };

  const baseProps = {
    cloudInfo,
    cloudOptions: [
      { label: "aws", value: "cloud-aws" },
      { label: "gce", value: "cloud-gce" },
    ],
    credentialsOptions: [
      { label: "aws-cred", value: "aws-cred" },
      { label: "gce-cred", value: "gce-cred" },
    ],
    defaultCloud: "cloud-aws",
    onCloudChange: vi.fn(),
    toRegionOptions: (
      inputCloudInfo: CloudState["clouds"],
      cloudValue: string,
    ): { label: string; value: string }[] => [
      { label: "", value: "" },
      ...((inputCloudInfo?.[cloudValue]?.regions ?? []).map((region) => ({
        label: region.name,
        value: region.name,
      })) as { label: string; value: string }[]),
    ],
  };

  it("renders mandatory details fields", () => {
    renderComponent(
      <Formik<AddModelFormState>
        initialValues={{
          modelName: "",
          cloud: "cloud-aws",
          region: "",
          credential: "",
        }}
        onSubmit={vi.fn()}
      >
        <Fields {...baseProps} />
      </Formik>,
    );

    expect(screen.getByLabelText("Model name")).toBeInTheDocument();
    expect(screen.getByLabelText("Cloud")).toBeInTheDocument();
    expect(screen.getByLabelText("Region (optional)")).toBeInTheDocument();
    expect(screen.getByLabelText("Credential")).toBeInTheDocument();
  });

  it("clears region when cloud changes and calls onCloudChange", async () => {
    const onCloudChange = vi.fn();

    renderComponent(
      <Formik<AddModelFormState>
        initialValues={{
          modelName: "my-model",
          cloud: "cloud-aws",
          region: "us-east-1",
          credential: "aws-cred",
        }}
        onSubmit={vi.fn()}
      >
        <Fields {...baseProps} onCloudChange={onCloudChange} />
      </Formik>,
    );

    await userEvent.selectOptions(screen.getByLabelText("Cloud"), "cloud-gce");

    expect(screen.getByLabelText("Region (optional)")).toHaveValue("");
    expect(onCloudChange).toHaveBeenCalledWith("cloud-gce");
  });

  it("disables region and credential when cloud is empty", () => {
    renderComponent(
      <Formik<AddModelFormState>
        initialValues={{
          modelName: "",
          cloud: "",
          region: "",
          credential: "",
        }}
        onSubmit={vi.fn()}
      >
        <Fields {...baseProps} />
      </Formik>,
    );

    expect(screen.getByLabelText("Region (optional)")).toBeDisabled();
    expect(screen.getByLabelText("Credential")).toBeDisabled();
  });
});
