// TODO: this file should be removed once the audit log endpoint is available on
// the JIMM facade.

import type { AuditEvent } from "juju/jimm-facade";
import { auditEventFactory } from "testing/factories/juju/jimm";

export const generateFakeAuditLogs = (length?: number) => {
  const events: AuditEvent[] = [];
  const count = length !== undefined ? length : Math.random() * 50;
  for (let index = 0; index < count; index++) {
    events[index] = auditEventFactory.build();
  }
  return events;
};
