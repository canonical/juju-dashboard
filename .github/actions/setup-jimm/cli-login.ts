import { OIDC } from "../../../e2e/helpers/user/oidc";

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
if (!username || !password) {
  throw new Error(
    `Did not receive all environment variables, got username: "${username}", password: "${password}".`,
  );
}
console.log("Logging in to JIMM.");
await OIDC.loginCli({
  username,
  password,
});
console.log("Logged in.");
