import { exec } from ".";

export async function login(username: string, password: string): Promise<void> {
  await exec("juju logout");
  await exec(`echo '${password}' | juju login -u '${username}' --no-prompt`);
}

export async function isUser(username: string): Promise<boolean> {
  const currentUser = await exec(`juju whoami --format json | yq .user`);
  return currentUser.stdout.trim() === username;
}
