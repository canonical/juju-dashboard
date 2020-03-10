import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

jest.mock("app/use-config-hook", () =>
  jest.fn(() => ({
    baseControllerURL: "jimm.jujucharms.com",
    baseAppURL: "/",
    identityProviderAvailable: true
  }))
);

jest.mock("react-ga");
