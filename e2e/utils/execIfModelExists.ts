import { exec } from ".";

export async function execIfModelExists(
  command: string,
  modelName: string,
): Promise<void> {
  let modelExists = true;
  try {
    await exec(`juju show-model ${modelName}`);
  } catch (error) {
    modelExists = false;
  }
  if (modelExists) {
    await exec(command);
  }
}
