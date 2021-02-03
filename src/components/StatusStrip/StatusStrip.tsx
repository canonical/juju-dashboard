import { useState, useEffect, ReactNode } from "react";

import "./_status-strip.scss";

type Status = {
  label: string;
  count: number;
};

type Props = {
  statusList: {
    model: Status[];
  };
};

export default function StatusStrip({ statusList }: Props) {
  type Status = {
    groupName: string;
    statement: ReactNode;
    count: number;
  };
  const [status, setStatus] = useState<Status>({
    groupName: "",
    statement: [],
    count: 0,
  });

  useEffect(() => {
    let proposedStatus: Status = {
      groupName: "",
      statement: [],
      count: 0,
    };
    let count = 0;

    function incrementCount(incrementBy: number) {
      count = count + incrementBy;
    }

    Object.entries(statusList).forEach(([groupName, statuses]) => {
      const statement =
        statuses &&
        Object.values(statuses).map((status) => {
          incrementCount(status.count);
          return (
            <div className="p-chip" key={status.label}>
              <span
                className={`status-icon is-${status.label.toLowerCase()}`}
              >{`${status.count} ${status.label}`}</span>
            </div>
          );
        });
      proposedStatus = { groupName, statement, count };
    });

    setStatus(proposedStatus);
  }, [statusList]);

  return (
    <>
      {status?.count > 0 && (
        <div className="status-strip">
          <span className="status-strip__statement">{status.statement}</span>
        </div>
      )}
    </>
  );
}
