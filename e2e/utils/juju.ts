import { exec, shell } from ".";

export async function login(username: string, password: string) {
  await exec("juju", "logout").exit;
  await shell(`echo '${password}' | juju login -u '${username}' --no-prompt`)
    .exit;
}
