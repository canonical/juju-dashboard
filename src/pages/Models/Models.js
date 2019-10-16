import React from "react";

import Layout from "components/Layout/Layout";
import TableList from "components/TableList/TableList";

export default function Models() {
  return (
    <Layout sidebar>
      <div className="p-strip is-shallow">
        <div className="row">
          <TableList />
        </div>
      </div>
    </Layout>
  );
}
