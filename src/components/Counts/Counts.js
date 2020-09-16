import React from "react";
import { pluralize } from "app/utils";

import "./_counts.scss";

const Counts = ({ primaryEntity, secondaryEntities }) => {
  const statuses = secondaryEntities
    ?.map((entity) => {
      return `${entity.count} ${pluralize(entity.count, entity.label)}`;
    })
    .join(", ");
  return (
    <small className="entity-counts">
      {primaryEntity.count}{" "}
      {pluralize(primaryEntity.count, primaryEntity.label)}: {statuses}
    </small>
  );
};

export default Counts;
