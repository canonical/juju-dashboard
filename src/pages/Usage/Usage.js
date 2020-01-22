import React from "react";
import Layout from "components/Layout/Layout";
import Notification from "@canonical/react-components/dist/components/Notification/Notification";

export default function Usage() {
  return (
    <Layout>
      <div className="row">
        <Notification type="caution">
          We're still working on this functionality - please check back soon!
        </Notification>
      </div>
    </Layout>
  );
}
