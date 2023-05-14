import type { ConnectionInfo } from "@canonical/jujulib";
import { Factory } from "fishery";

export const connectionInfoFactory = Factory.define<ConnectionInfo>(() => ({}));
