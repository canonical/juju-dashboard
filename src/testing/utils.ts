import { ReactWrapper } from "enzyme";
import { act } from "react-dom/test-utils";

/**
 Fixes the error...
 Warning: An update to Foo inside a test was not wrapped in act(...).
 https://github.com/enzymejs/enzyme/issues/2073
 @param {ReactWrapper} wrapper The wrapper output from the enzyme `mount`
  command.
*/
export const waitForComponentToPaint = async (wrapper: typeof ReactWrapper) => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve));
    wrapper.update();
  });
};
