import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { format } from "date-fns";

import { renderComponent } from "testing/utils";

import AuditLogsFilterPanel, { Label } from "./AuditLogsFilterPanel";
import { Label as FieldLabel } from "./Fields/Fields";

describe("AuditLogsFilterPanel", () => {
  it("restores the filter values from the URL", async () => {
    const params = {
      after: format(new Date(), "yyyy-MM-dd'T'hh:mm"),
      before: format(new Date(), "yyyy-MM-dd'T'hh:mm"),
      user: "user-eggman",
      model: "model1",
      facade: "Admin",
      method: "Login",
      version: "4",
      panel: "audit-log-filters",
    };
    const queryParams = new URLSearchParams(params);
    renderComponent(<AuditLogsFilterPanel />, {
      url: `/?${queryParams.toString()}`,
    });
    // Have to use querySelector here as RTL doesn't support datetime-local.
    expect(document.querySelector(`input#${FieldLabel.AFTER}`)).toHaveValue(
      params.after
    );
    // Have to use querySelector here as RTL doesn't support datetime-local.
    expect(document.querySelector(`input#${FieldLabel.AFTER}`)).toHaveValue(
      params.before
    );
    expect(screen.getByRole("combobox", { name: FieldLabel.USER })).toHaveValue(
      params.user
    );
    expect(
      screen.getByRole("combobox", { name: FieldLabel.METHOD })
    ).toHaveValue(params.method);
    expect(
      screen.getByRole("combobox", { name: FieldLabel.FACADE })
    ).toHaveValue(params.facade);
    expect(
      screen.getByRole("combobox", { name: FieldLabel.METHOD })
    ).toHaveValue(params.method);
    expect(
      screen.getByRole("spinbutton", { name: FieldLabel.VERSION })
    ).toHaveValue(Number(params.version));
    expect(
      await screen.findByRole("spinbutton", { name: FieldLabel.VERSION })
    ).toHaveValue(Number(params.version));
  });

  it("can clear the filters", async () => {
    const params = {
      after: new Date().toISOString(),
      before: new Date().toISOString(),
      user: "user-eggman",
      model: "model1",
      facade: "Admin",
      method: "Login",
      version: "4",
      panel: "audit-log-filters",
    };
    const queryParams = new URLSearchParams(params);
    renderComponent(<AuditLogsFilterPanel />, {
      url: `/?${queryParams.toString()}`,
    });
    await userEvent.click(screen.getByRole("button", { name: Label.CLEAR }));
    expect(window.location.search).toBe("");
  });

  it("can update the filters", async () => {
    const params = {
      after: format(new Date(), "yyyy-MM-dd'T'hh:mm"),
      before: format(new Date(), "yyyy-MM-dd'T'hh:mm"),
      user: "user-eggman",
      model: "model1",
      facade: "Admin",
      method: "Login",
      version: "4",
    };
    renderComponent(<AuditLogsFilterPanel />, {
      url: "/?panel=audit-log-filters",
    });
    const after = document.querySelector<HTMLInputElement>(
      `input#${FieldLabel.AFTER}`
    );
    expect(after).toBeTruthy();
    if (after) {
      await userEvent.type(after, params.after);
    }
    const before = document.querySelector<HTMLInputElement>(
      `input#${FieldLabel.BEFORE}`
    );
    expect(before).toBeTruthy();
    if (before) {
      await userEvent.type(before, params.before);
    }
    await userEvent.type(
      screen.getByRole("combobox", { name: FieldLabel.USER }),
      params.user
    );
    await userEvent.type(
      screen.getByRole("combobox", { name: FieldLabel.MODEL }),
      params.model
    );
    await userEvent.type(
      screen.getByRole("combobox", { name: FieldLabel.FACADE }),
      params.facade
    );
    await userEvent.type(
      screen.getByRole("combobox", { name: FieldLabel.METHOD }),
      params.method
    );
    await userEvent.type(
      screen.getByRole("spinbutton", { name: FieldLabel.VERSION }),
      params.version
    );
    await userEvent.click(screen.getByRole("button", { name: Label.FILTER }));
    const queryParams = new URLSearchParams(params);
    expect(window.location.search).toBe(`?${queryParams.toString()}`);
  });
});
