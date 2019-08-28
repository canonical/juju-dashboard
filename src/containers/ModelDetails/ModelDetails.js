import React, { Component } from "react";

import Shell from "../../components/Shell/Shell";
import Filter from "../../components/Filter/Filter";
import InfoPanel from "../../components/InfoPanel/InfoPanel";
import MainTable from "../../components/MainTable/MainTable";

import "./_model-details.scss";

const MainTableHeaders = [
  { content: "App", sortKey: "app" },
  { content: "Status", sortKey: "status" },
  { content: "Version", sortKey: "version" },
  { content: "Scale", sortKey: "scale", className: "u-align--right" },
  { content: "Store", sortKey: "store" },
  { content: "Rev", sortKey: "rev", className: "u-align--right" },
  { content: "OS", sortKey: "os" },
  { content: "Notes", sortKey: "notes" }
];

const MainTableRows = [
  {
    columns: [
      { content: "Ready", role: "rowheader" },
      { content: 1 },
      { content: "1 GiB" },
      { content: 2, className: "u-align--right" },
      { content: "Ready" },
      { content: 1, className: "u-align--right" },
      { content: "1 GiB" },
      { content: 2 }
    ],
    sortData: {
      app: "ready",
      status: 2,
      version: 1,
      scale: 2,
      store: "ready",
      rev: 2,
      os: 1,
      notes: 2
    }
  },
  {
    columns: [
      { content: "Idle", role: "rowheader" },
      { content: 1, className: "u-align--right" },
      { content: "1 GiB", className: "u-align--right" },
      { content: 2, className: "u-align--right" },
      { content: "Ready" },
      { content: 1, className: "u-align--right" },
      { content: "1 GiB" },
      { content: 2 }
    ],
    sortData: {
      status: "idle",
      cores: 1,
      ram: 1,
      disks: 2
    }
  },
  {
    columns: [
      { content: "Waiting", role: "rowheader" },
      { content: 8 },
      { content: "3.9 GiB" },
      { content: 3, className: "u-align--right" },
      { content: "Ready" },
      { content: 1, className: "u-align--right" },
      { content: "1 GiB" },
      { content: 2 }
    ],
    sortData: {
      status: "waiting",
      cores: 8,
      ram: 3.9,
      disks: 3
    }
  }
];

export default class ModelDetails extends Component {
  render() {
    const viewFilters = ["all", "apps", "units", "machines", "relations"];
    const statusFilters = ["all", "maintenance", "blocked"];
    return (
      <div className="model-details">
        <InfoPanel />
        <div className="model-details__main">
          <div className="model-details__filters">
            <Filter label="View" filters={viewFilters} />
            <Filter label="Status" filters={statusFilters} />
          </div>
          <MainTable headers={MainTableHeaders} rows={MainTableRows} sortable />
        </div>
        <Shell />
      </div>
    );
  }
}
