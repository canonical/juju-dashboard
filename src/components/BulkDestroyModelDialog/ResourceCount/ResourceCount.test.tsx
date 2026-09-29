import { render, screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { act } from "react";

import ResourceCount from "./ResourceCount";
import { ResourceType } from "./types";

describe("ResourceCount", () => {
  let userEventWithTimers: UserEvent;

  beforeEach(() => {
    vi.useFakeTimers();
    userEventWithTimers = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the count and label correctly", () => {
    render(
      <ResourceCount
        resourceType={ResourceType.MODEL}
        resources={["model-a", "model-b"]}
      />,
    );
    expect(screen.getByText(/2 Models/)).toBeInTheDocument();
  });

  it("renders the correct icon for the resource type", () => {
    render(
      <ResourceCount
        resourceType={ResourceType.MACHINE}
        resources={["machine-0"]}
      />,
    );
    expect(document.querySelector(".p-icon--machines")).toBeInTheDocument();
  });

  it("renders a tooltip with the resource names", async () => {
    render(
      <ResourceCount
        resourceType={ResourceType.STORAGE}
        resources={["vol-0", "vol-1"]}
      />,
    );
    const icon = document.querySelector(".p-icon--information");
    expect(icon).toBeInTheDocument();
    await act(async () => {
      if (!icon) {
        throw new Error("Icon not found");
      }
      await userEventWithTimers.hover(icon);
      vi.runAllTimers();
    });
    expect(screen.getByRole("tooltip", { name: "vol-0\nvol-1" })).toBeVisible();
  });
});
