import React from "react";
import { useSelector } from "react-redux";

import { getActiveUserTag } from "app/selectors";

import StatusGroup from "./StatusGroup";
import OwnerGroup from "./OwnerGroup";

import "./_model-table-list.scss";

export default function ModelTableList({ groupedBy }) {
  // Even though the activeUser tag is needed many functions deep, because
  // hooks _must_ be called in the same order every time we have to get it here
  // and pass it down through the `generateModelTableData` function as the order
  // of the model data changes frequently and it's guaranteed to almost never be
  // in the same order.
  const activeUser = useSelector(getActiveUserTag);

  switch (groupedBy) {
    case "status":
      return <StatusGroup activeUser={activeUser} />;
    case "owner":
      return <OwnerGroup />;
    case "cloud":
      return <p>@TODO: Group by cloud</p>;
    default:
      return <p>Unknown grouping: {groupedBy}</p>;
  }
}
