import React from "react";
import Notification from "@canonical/react-components/dist/components/Notification/Notification";

import Layout from "components/Layout/Layout";

export default function Logs() {
  return (
    <Layout>
      <div className="row">
        <Notification type="caution">
          We&apos;re still working on this functionality - please check back
          soon!
        </Notification>
      </div>
    </Layout>
  );
}
