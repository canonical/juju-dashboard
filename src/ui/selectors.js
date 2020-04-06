// ----- Exported functions

/**
  Checks state to see if the sidebar is collapsible.
  Usage:
    const isSidebarCollapsible = useSelector(isSidebarCollapsible);

  @param {Object} state The application state.
  @returns {Boolean} If the sidebar is collapsible.
*/
export const isSidebarCollapsible = (state) => state?.ui?.collapsibleSidebar;

/**
  Checks state to see if the user menu is active.
  Usage:
    const isUserMenuActive = useSelector(isUserMenuActive);

  @param {Object} state The application state.
  @returns {Boolean} If the user menu is active
*/
export const isUserMenuActive = (state) => state?.ui?.userMenuActive;

/**
  Checks state to see if the external nav is active.
  Usage:
    const externalNavActive = useSelector(isExternalNavActive);

  @param {Object} state The application state.
  @returns {Boolean} If the external navigation menu is active
*/
export const isExternalNavActive = (state) => state?.ui?.externalNavActive;
