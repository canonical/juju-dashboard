import React from "react";
import { useSelector } from "react-redux";

import { getActiveUserTag } from "app/selectors";

import StatusGroup from "./StatusGroup";
import CloudGroup from "./CloudGroup";
import OwnerGroup from "./OwnerGroup";

import "./_model-table-list.scss";

export default function ModelTableList({ groupedBy }) {
  const activeUser = useSelector(getActiveUserTag);
  switch (groupedBy) {
    case "status":
    default:
      return <StatusGroup activeUser={activeUser} />;
    case "cloud":
      return <CloudGroup activeUser={activeUser} />;
    case "owner":
      return <OwnerGroup activeUser={activeUser} />;
  }
}
