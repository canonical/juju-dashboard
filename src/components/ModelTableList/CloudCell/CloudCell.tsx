import type { FC } from "react";

import awsLogo from "static/images/logo/cloud/aws.svg";
import azureLogo from "static/images/logo/cloud/azure.svg";
import gceLogo from "static/images/logo/cloud/gce.svg";
import kubernetesLogo from "static/images/logo/cloud/kubernetes.svg";
import type { ModelData } from "store/juju/types";
import { testId } from "testing/utils";

import { generateCloudAndRegion } from "../shared";

import { TestId } from "./types";

type Props = {
  model: ModelData;
};

const CloudCell: FC<Props> = ({ model }: Props) => {
  const provider = model?.info?.["provider-type"];
  let src: null | string = null;
  let alt: null | string = null;
  switch (provider) {
    case "ec2":
      src = awsLogo;
      alt = "AWS logo";
      break;
    case "gce":
      src = gceLogo;
      alt = "Google Cloud Platform logo";
      break;
    case "azure":
      src = azureLogo;
      alt = "Azure logo";
      break;
    case "kubernetes":
      src = kubernetesLogo;
      alt = "Kubernetes logo";
      break;
  }
  return (
    <>
      {src && alt ? (
        <img
          src={src}
          alt={alt}
          className="p-table__logo"
          {...testId(TestId.PROVIDER_LOGO)}
        />
      ) : null}
      {generateCloudAndRegion(model)}
    </>
  );
};

export default CloudCell;
