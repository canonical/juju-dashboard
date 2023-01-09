import { configure } from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import "@testing-library/jest-dom";
import util from "util";
import crypto from "crypto";

configure({ adapter: new Adapter() });

jest.mock("react-ga");

// XXX jsdom does not support the web animations api
const animateMock = () => {
  return { onfinish: () => {} };
};

if (!window.HTMLDivElement.prototype.animate) {
  window.HTMLDivElement.prototype.animate = animateMock;
} else {
  console.error(
    "JSDOM appears to support the web animations api",
    "you may now remove the mock"
  );
}

// Provide node modules that are required by bakeryjs.
global.TextDecoder = util.TextDecoder;
global.TextEncoder = util.TextEncoder;
global.crypto = crypto;
