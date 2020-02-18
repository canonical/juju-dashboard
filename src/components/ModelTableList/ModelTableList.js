import React from "react";
import { useSelector } from "react-redux";

import { getActiveUserTag } from "app/selectors";

import StatusGroup from "./StatusGroup";
import CloudGroup from "./CloudGroup";
import OwnerGroup from "./OwnerGroup";

import "./_model-table-list.scss";

export default function ModelTableList({ filters, groupedBy }) {
  const activeUser = useSelector(getActiveUserTag);
  switch (groupedBy) {
    case "status":
    default:
      return <StatusGroup activeUser={activeUser} filters={filters} />;
    case "cloud":
      return <CloudGroup activeUser={activeUser} filters={filters} />;
    case "owner":
      return <OwnerGroup activeUser={activeUser} filters={filters} />;
  }
}
