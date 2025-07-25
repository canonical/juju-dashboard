import { actions } from "store/general";

import { login } from "./login";

describe("login", () => {
  it("starts login", () => {
    const dispatch = vi.fn().mockReturnValue(new Promise(() => {}));

    login(dispatch, "wss://jimm.jujucharms.com/api", {
      user: "someone",
      password: "secret",
    });

    expect(dispatch).nthCalledWith(1, actions.cleanupLoginErrors());
    expect(dispatch).nthCalledWith(
      2,
      actions.storeUserPass({
        wsControllerURL: "wss://jimm.jujucharms.com/api",
        credential: { user: "someone", password: "secret" },
      }),
    );
    expect(dispatch).nthCalledWith(3, actions.updateLoginLoading(true));
  });
});
