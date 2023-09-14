import { render, fireEvent } from "@testing-library/react";

import defaultCharmIcon from "static/images/icons/default-charm-icon.svg";
import { charmApplicationFactory } from "testing/factories/juju/Charms";
import { relationChangeDeltaFactory } from "testing/factories/juju/model-watcher";

import Topology from "./Topology";

describe("Topology", () => {
  const annotations = {
    landscape: {
      "gui-x": "100",
      "gui-y": "150",
    },
    postgresql: {
      "gui-x": "250",
      "gui-y": "300",
    },
  };
  const applications = {
    landscape: charmApplicationFactory.build({
      "charm-url": "ch:amd64/jammy/landscape-1",
    }),
    postgresql: charmApplicationFactory.build({
      "charm-url": "ch:amd64/jammy/postgresql-2",
    }),
  };
  const relations = {
    "landscape:db postgresql:db": relationChangeDeltaFactory.build(),
  };

  it("sets the canvas size", () => {
    render(
      <Topology
        annotations={annotations}
        applications={applications}
        height={100}
        relations={relations}
        width={200}
      />
    );
    expect(document.querySelector("svg")).toHaveAttribute(
      "viewBox",
      "0 0 200 100"
    );
  });

  it("resizes the canvas when new applications are added", () => {
    const getBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = () =>
      ({
        height: 100,
        width: 100,
      } as DOMRect);
    render(
      <Topology
        annotations={annotations}
        applications={applications}
        height={100}
        relations={relations}
        width={50}
      />
    );
    expect(document.querySelector("svg > g")).toHaveAttribute(
      "transform",
      "translate(20,20) scale(0.2,0.2)"
    );
    Element.prototype.getBoundingClientRect = getBoundingClientRect;
  });

  it("creates the applications", () => {
    render(
      <Topology
        annotations={annotations}
        applications={applications}
        height={100}
        relations={relations}
        width={200}
      />
    );
    const apps = document.querySelectorAll(".application");
    expect(apps[0]).toHaveAttribute("data-name", "landscape");
    expect(apps[0]).toHaveAttribute("transform", "translate(0, 0)");
    expect(apps[0].querySelector("circle")).toBeInTheDocument();
    expect(apps[0].querySelector("image")).toBeInTheDocument();
    expect(apps[0].querySelector("image")).toHaveAttribute(
      "href",
      "https://charmhub.io/landscape/icon"
    );
    expect(apps[1]).toHaveAttribute("data-name", "postgresql");
    expect(apps[1]).toHaveAttribute("transform", "translate(150, 150)");
    expect(apps[1].querySelector("circle")).toBeInTheDocument();
    expect(apps[1].querySelector("image")).toBeInTheDocument();
    expect(apps[1].querySelector("image")).toHaveAttribute(
      "href",
      "https://charmhub.io/postgresql/icon"
    );
  });

  it("sets the size of subordinate applications", () => {
    const applications = {
      landscape: charmApplicationFactory.build({
        subordinate: false,
      }),
      postgresql: charmApplicationFactory.build({
        subordinate: true,
      }),
    };
    render(
      <Topology
        annotations={annotations}
        applications={applications}
        height={100}
        relations={relations}
        width={200}
      />
    );
    const apps = document.querySelectorAll(".application");
    // Regular app:
    const landscapeCircle = apps[0].querySelector("circle");
    const landscapeImage = apps[0].querySelector("image");
    expect(landscapeCircle).toHaveAttribute("cx", "90");
    expect(landscapeCircle).toHaveAttribute("cy", "90");
    expect(landscapeCircle).toHaveAttribute("r", "90");
    expect(landscapeImage).toHaveAttribute("width", "126");
    expect(landscapeImage).toHaveAttribute("height", "126");
    expect(landscapeImage).toHaveAttribute("transform", "translate(28, 28)");
    expect(landscapeImage).toHaveAttribute(
      "clip-path",
      "circle(55px at 63px 63px)"
    );
    // Subordinate app:
    const postgresqlCircle = apps[1].querySelector("circle");
    const postgresqlImage = apps[1].querySelector("image");
    expect(postgresqlCircle).toHaveAttribute("cx", "60");
    expect(postgresqlCircle).toHaveAttribute("cy", "60");
    expect(postgresqlCircle).toHaveAttribute("r", "60");
    expect(postgresqlImage).toHaveAttribute("width", "96");
    expect(postgresqlImage).toHaveAttribute("height", "96");
    expect(postgresqlImage).toHaveAttribute("transform", "translate(13, 13)");
    expect(postgresqlImage).toHaveAttribute(
      "clip-path",
      "circle(43px at 48px 48px)"
    );
  });

  it("displays a fallback icon if an image doesn't load", () => {
    render(
      <Topology
        annotations={annotations}
        applications={applications}
        height={100}
        relations={relations}
        width={200}
      />
    );
    const apps = document.querySelectorAll(".application");
    const landscapeImage = apps[0].querySelector("image");
    expect(landscapeImage).toBeTruthy();
    if (landscapeImage) {
      fireEvent.error(landscapeImage);
    }
    expect(landscapeImage).toHaveAttribute("href", defaultCharmIcon);
  });

  it("positions the applications if they don't have annotations", () => {
    render(
      <Topology
        annotations={{}}
        applications={applications}
        height={100}
        relations={relations}
        width={200}
      />
    );
    const apps = document.querySelectorAll(".application");
    expect(apps[0]).toHaveAttribute("transform", "translate(0, 0)");
    expect(apps[1]).toHaveAttribute("transform", "translate(250, 0)");
  });

  it("displays relations", () => {
    render(
      <Topology
        annotations={annotations}
        applications={applications}
        height={100}
        relations={relations}
        width={200}
      />
    );
    const relationLine = document
      .querySelector(".relation")
      ?.querySelector("line");
    expect(relationLine).toHaveAttribute("x1", "90");
    expect(relationLine).toHaveAttribute("x2", "240");
    expect(relationLine).toHaveAttribute("y1", "90");
    expect(relationLine).toHaveAttribute("y2", "240");
  });
});
