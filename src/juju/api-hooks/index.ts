export {
  useGetApplicationConfig,
  useSetApplicationConfig,
  type Label as ApplicationLabel,
} from "./application";
export {
  useListSecrets,
  useGetSecretContent,
  useCreateSecrets,
  useUpdateSecrets,
  useRemoveSecrets,
  useGrantSecret,
  useRevokeSecret,
  type Label as SecretsLabel,
} from "./secrets";
