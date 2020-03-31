// Action labels
export const actionsList = {
  collapsibleSidebar: "TOGGLE_COLLAPSIBLE_SIDEBAR"
};

/**
  Toggle collapsible sidebar
*/
export function collapsibleSidebar(toggle) {
  return {
    type: actionsList.collapsibleSidebar,
    payload: toggle
  };
}
