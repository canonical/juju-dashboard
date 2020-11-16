import React from "react";

import Layout from "components/Layout/Layout";

import useWindowTitle from "hooks/useWindowTitle";

export default function NotFound() {
  useWindowTitle("Page not found");
  return (
    <Layout>
      <div className="p-strip">
        <div className="row">
          <h2>¯\_(ツ)_/¯</h2>
        </div>
      </div>
    </Layout>
  );
}
