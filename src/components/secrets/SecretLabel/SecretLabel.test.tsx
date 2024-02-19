import { listSecretResultFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import SecretLabel from "./SecretLabel";

describe("SecretLabel", () => {
  it("displays label and id", async () => {
    const secret = listSecretResultFactory.build({
      label: "secret1",
      uri: "secret:aabbccdd",
    });
    const { result } = renderComponent(<SecretLabel secret={secret} />);
    expect(result.container).toHaveTextContent("secret1 (aabbccdd)");
  });

  it("displays id", async () => {
    const secret = listSecretResultFactory.build({
      label: undefined,
      uri: "secret:aabbccdd",
    });
    const { result } = renderComponent(<SecretLabel secret={secret} />);
    expect(result.container).toHaveTextContent("aabbccdd");
  });
});
