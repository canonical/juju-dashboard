import { useSyncModelCanConfigure } from "hooks/useCanConfigureModel";

type Props = {
  modelUUID: string;
};

// Renders nothing: lets a list of models each run the permission check hook.
export default function SyncModelCanConfigure({ modelUUID }: Props): null {
  useSyncModelCanConfigure(modelUUID);
  return null;
}
