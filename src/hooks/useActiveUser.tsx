import { useSelector, useStore } from "react-redux";
import { getActiveUserTag, getWSControllerURL } from "store/general/selectors";

export default function useActiveUser() {
  const store = useStore();
  const getState = store.getState;
  return getActiveUserTag(getState(), useSelector(getWSControllerURL))?.replace(
    "user-",
    ""
  );
}
