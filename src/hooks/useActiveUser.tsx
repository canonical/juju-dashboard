import { useSelector, useStore } from "react-redux";
import { getActiveUserTag, getWSControllerURL } from "app/selectors";
import { TSFixMe } from "types";

export default function useActiveUser() {
  const store = useStore();
  const getState = store.getState;
  return getActiveUserTag(
    useSelector(getWSControllerURL),
    getState() as TSFixMe
  )?.replace("user-", "");
}
