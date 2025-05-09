import { OIDC } from "../../../e2e/helpers/auth/backends";

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
if (!username || !password) {
  throw new Error(
    `Did not receive all environment variables, got username: "${username}", password: "${password}".`,
  );
}
console.log("Logging in to JIMM.");
await OIDC.loginCLI(
  {
    username,
    password,
  },
  // Register the controller.
  true,
);
console.log("Logged in.");
