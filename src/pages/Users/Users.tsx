import { ReBACAdmin } from "@canonical/rebac-admin";

import BaseLayout from "layout/BaseLayout/BaseLayout";

const Users = (): JSX.Element => (
  <BaseLayout>
    <ReBACAdmin apiURL="http://example.com/api" />
  </BaseLayout>
);

export default Users;
