import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";

import { renderComponent } from "testing/utils";
import { AccessLevel } from "types";

import AccessLevelDropdown from "./AccessLevelDropdown";

describe("AccessLevelDropdown", () => {
  it("should update value in formik", async () => {
    const onSubmit = vi.fn();
    renderComponent(
      <Formik
        initialValues={{
          shareModelWith: {
            "test@example.com": AccessLevel.READ,
          },
        }}
        onSubmit={onSubmit}
      >
        {(props) => (
          <form onSubmit={props.handleSubmit}>
            <AccessLevelDropdown
              value={
                props.values.shareModelWith["test@example.com"] ??
                AccessLevel.READ
              }
              userName="test@example.com"
            />
            <button type="submit">Submit</button>
          </form>
        )}
      </Formik>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Read" }));
    await userEvent.click(screen.getByRole("option", { name: "Write" }));
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).toHaveBeenCalledWith(
      { shareModelWith: { "test@example.com": AccessLevel.WRITE } },
      expect.any(Object),
    );
  });
});
