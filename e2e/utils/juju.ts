import { exec } from ".";

export async function login(username: string, password: string) {
  await exec("juju logout");
  await exec(`echo '${password}' | juju login -u '${username}' --no-prompt`);
}
