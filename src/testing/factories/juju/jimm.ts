import { Factory } from "fishery";

import type { AuditEvent } from "juju/jimm-facade";

export const auditEventFactory = Factory.define<AuditEvent>(() => ({
  time: "2023-07-01T09:04:04.279Z",
  "conversation-id": "fakeabc123",
  "message-id": 2,
  "facade-name": "ModelManager",
  "facade-method": "AddModel",
  "facade-version": 3,
  "object-id": "4",
  "user-tag": "user-eggman",
  model: "microk8s",
  "is-response": false,
  params: null,
  errors: null,
}));
