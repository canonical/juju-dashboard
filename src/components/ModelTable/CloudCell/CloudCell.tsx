import { useMemo, type FC } from "react";

import TruncatedTooltip from "components/TruncatedTooltip";
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
  const { src, alt } = useMemo(() => {
    switch (provider) {
      case "ec2":
        return {
          src: awsLogo,
          alt: "AWS logo",
        };
      case "gce":
        return {
          src: gceLogo,
          alt: "Google Cloud Platform logo",
        };
      case "azure":
        return {
          src: azureLogo,
          alt: "Azure logo",
        };
      case "kubernetes":
        return {
          src: kubernetesLogo,
          alt: "Kubernetes logo",
        };
    }
    return { src: null, alt: null };
  }, [provider]);
  const regionText = useMemo(() => {
    return generateCloudAndRegion(model);
  }, [model]);
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

      <TruncatedTooltip message={regionText}>{regionText}</TruncatedTooltip>
    </>
  );
};

export default CloudCell;
