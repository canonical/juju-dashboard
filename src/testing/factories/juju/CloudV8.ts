import type { ModelConfigSchemaField } from "@canonical/jujulib/dist/api/facades/cloud/CloudV8";
import { Factory } from "fishery";

export const modelConfigSchemaFieldFactory =
  Factory.define<ModelConfigSchemaField>(() => ({
    description: "",
    type: "string",
  }));
