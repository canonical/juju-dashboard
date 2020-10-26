// ----- Exported functions

/**
  Checks state to see if the user menu is active.
  Usage:
    const isUserMenuActive = useSelector(isUserMenuActive);

  @param {Object} state The application state.
  @returns {Boolean} If the user menu is active
*/
export const isUserMenuActive = (state) => state?.ui?.userMenuActive;
