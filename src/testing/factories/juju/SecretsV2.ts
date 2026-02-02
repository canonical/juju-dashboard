import type {
  AccessInfo,
  ListSecretResult,
  SecretRevision,
} from "@canonical/jujulib/dist/api/facades/secrets/SecretsV2";
import { Factory } from "fishery";

export const secretRevisionFactory = Factory.define<SecretRevision>(() => ({
  revision: 1,
}));

export const secretAccessInfoFactory = Factory.define<AccessInfo>(() => ({
  role: "view",
  "scope-tag": "model-abc123",
  "target-tag": "application-lxd",
}));

export const listSecretResultFactory = Factory.define<ListSecretResult>(() => ({
  "create-time": "2024-01-05T05:10:17Z",
  "latest-revision": 1,
  "owner-tag": "model-ab02a18f-1ea9-49cb-898d-cad17d330b21",
  "update-time": "2024-01-05T05:10:17Z",
  revisions: [],
  // spell-checker:disable-next-line
  uri: "secret:amboue9tqlp3g6kgq300",
  version: 1,
}));
