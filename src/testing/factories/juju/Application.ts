import type {
  ApplicationGetResults,
  Base,
  Value,
  ErrorResults,
} from "@canonical/jujulib/dist/api/facades/application/ApplicationV18";
import { Factory } from "fishery";

export const applicationConfigFactory = Factory.define<
  NonNullable<ApplicationGetResults["application-config"]>
>(() => ({
  trust: configFactory.build({
    default: false,
    description: "Does this application have access to trusted credentials",
    type: "bool",
    value: false,
  }),
}));

export const configFactory = Factory.define<ApplicationGetResults["config"]>(
  () => ({
    default: "",
    description:
      "Base64 encoded Certificate Authority (CA) bundle. Setting this config\nallows container runtimes to pull images from registries with TLS\ncertificates signed by an external CA.\n",
    source: "default",
    type: "string",
    value: "",
  })
);

export const constraintsFactory = Factory.define<Value>(() => ({
  "allocate-public-ip": false,
  arch: "amd64",
  container: "",
  cores: 0,
  "cpu-power": 0,
  "image-id": "123",
  "instance-role": "",
  "instance-type": "",
  mem: 0,
  "root-disk": 0,
  "root-disk-source": "",
  spaces: [],
  tags: [],
  "virt-type": "",
  zones: [],
}));

export const endpointBindingsFactory = Factory.define<
  NonNullable<ApplicationGetResults["endpoint-bindings"]>
>(() => ({
  "": "alpha",
  containerd: "alpha",
  "docker-registry": "alpha",
  untrusted: "alpha",
}));

export const baseFactory = Factory.define<Base>(() => ({
  channel: "base",
  name: "base",
}));

export const applicationGetFactory = Factory.define<ApplicationGetResults>(
  () => ({
    application: "containerd",
    base: baseFactory.build(),
    charm: "containerd",
    config: {},
    "application-config": applicationConfigFactory.build(),
    constraints: constraintsFactory.build(),
    series: "focal",
    channel: "",
    "endpoint-bindings": endpointBindingsFactory.build(),
  })
);

export const errorResultsFactory = Factory.define<ErrorResults>(() => ({
  results: [],
}));
