// ----- Exported functions

/**
  Checks state to see if the sidebar is collapsible.
  Usage:
    const isSidebarCollapsible = useSelector(isSidebarCollapsible);

  @param {Object} state The application state.
  @returns {Boolean} If the sidebar is collapsible.
*/
export const isSidebarCollapsible = state => {
  if (state?.ui) {
    return state.ui.collapsibleSidebar;
  }
};

/**
  Checks state to see if the user menu is active.
  Usage:
    const isUserMenuActive = useSelector(isUserMenuActive);

  @param {Object} state The application state.
  @returns {Boolean} If the user menu is active
*/
export const isUserMenuActive = state => {
  if (state?.ui) {
    return state.ui.userMenuActive;
  }
};
