import { useSelector, useStore } from "react-redux";
import { getActiveUserTag, getWSControllerURL } from "app/selectors";

export default function useActiveUser() {
  const store = useStore();
  const getState = store.getState;
  return getActiveUserTag(useSelector(getWSControllerURL), getState())?.replace(
    "user-",
    ""
  );
}
