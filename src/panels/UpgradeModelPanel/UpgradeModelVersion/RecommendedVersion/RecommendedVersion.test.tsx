import { screen } from "@testing-library/react";
import { Formik } from "formik";

import { renderComponent } from "testing/utils";

import RecommendedVersion from "./RecommendedVersion";
import { Label, TestId } from "./types";

describe("RecommendedVersion", () => {
  it("displays the version details", async () => {
    renderComponent(
      <Formik initialValues={{}} onSubmit={vi.fn()}>
        <RecommendedVersion
          name="version"
          currentVersion="1.2.3"
          version={{
            date: "2006-01-02",
            lts: true,
            version: "3.5.14",
            "link-to-release":
              "https://github.com/juju/juju/releases/tag/v3.6.14",
            "requires-migration": true,
          }}
        />
      </Formik>,
    );
    expect(screen.getByRole("radio", { name: "3.5.14" })).toBeInTheDocument();
    expect(
      document.querySelector(".recommended-version__radio-date"),
    ).toHaveTextContent("2 Jan 2006");
  });

  it("displays tags for an LTS", async () => {
    renderComponent(
      <Formik initialValues={{}} onSubmit={vi.fn()}>
        <RecommendedVersion
          name="version"
          currentVersion="1.2.3"
          version={{
            date: "2006-01-02",
            lts: true,
            version: "3.5.14",
            "link-to-release":
              "https://github.com/juju/juju/releases/tag/v3.6.14",
            "requires-migration": true,
          }}
        />
      </Formik>,
    );
    expect(document.querySelector(".p-chip--information")).toHaveTextContent(
      Label.LTS,
    );
    expect(document.querySelector(".p-chip--positive")).toHaveTextContent(
      Label.RECOMMENDED,
    );
  });

  it("does not display tags for non-LTS versions", async () => {
    renderComponent(
      <Formik initialValues={{}} onSubmit={vi.fn()}>
        <RecommendedVersion
          name="version"
          currentVersion="1.2.3"
          version={{
            date: "2006-01-02",
            lts: false,
            version: "3.5.14",
            "link-to-release":
              "https://github.com/juju/juju/releases/tag/v3.6.14",
            "requires-migration": true,
          }}
        />
      </Formik>,
    );
    expect(document.querySelector(".p-chip--information")).toBeNull();
    expect(document.querySelector(".p-chip--positive")).toBeNull();
  });

  it("displays upgrade path when a migration is required", async () => {
    renderComponent(
      <Formik initialValues={{}} onSubmit={vi.fn()}>
        <RecommendedVersion
          name="version"
          currentVersion="1.2.3"
          version={{
            date: "2006-01-02",
            lts: true,
            version: "3.5.14",
            "link-to-release":
              "https://github.com/juju/juju/releases/tag/v3.6.14",
            "requires-migration": true,
          }}
        />
      </Formik>,
    );
    expect(screen.getByTestId(TestId.UPGRADE_PATH)).toHaveTextContent(
      "Upgrade path: 1.2.3 → Migrate → 3.5.14",
    );
  });
});
