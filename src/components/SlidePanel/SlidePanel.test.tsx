import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SlidePanel from "./SlidePanel";

describe("Slide Panel", () => {
  it("should display content", () => {
    render(
      <SlidePanel className="" isActive={false} onClose={jest.fn()}>
        <p>Slide panel content</p>
      </SlidePanel>
    );
    expect(screen.getByText("Slide panel content")).toBeInTheDocument();
  });

  it("should display when active", () => {
    const { container } = render(
      <SlidePanel
        className=""
        isActive={true}
        onClose={jest.fn()}
        children={null}
      />
    );
    expect(container.firstChild).toHaveAttribute("aria-hidden", "false");
  });

  it("should hide when inactive", () => {
    const { container } = render(
      <SlidePanel
        className=""
        isActive={false}
        onClose={jest.fn()}
        children={null}
      />
    );
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("should call close function when close button is clicked", async () => {
    const onClose = jest.fn();
    render(
      <SlidePanel
        className=""
        isActive={true}
        onClose={onClose}
        children={null}
      />
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalled();
  });

  it("should call close function when click is captured outside component", () => {
    const outerNode = document.createElement("div");
    const onClose = jest.fn();

    render(
      <SlidePanel
        className=""
        isActive={true}
        onClose={onClose}
        children={null}
      />,
      { container: document.body.appendChild(outerNode) }
    );
    const slidePanelContent = document.querySelector(`.slide-panel__content`);

    slidePanelContent?.dispatchEvent(new Event("click", { bubbles: true }));
    expect(onClose).not.toHaveBeenCalled();

    outerNode.dispatchEvent(new Event("click", { bubbles: true }));
    expect(onClose).toHaveBeenCalled();
  });

  it("should call close function when escape key is pressed", () => {
    const onClose = jest.fn();
    const outerNode = document.createElement("div");
    render(
      <SlidePanel
        className=""
        isActive={true}
        onClose={onClose}
        children={null}
      />,
      {
        container: document.body.appendChild(outerNode),
      }
    );
    outerNode.dispatchEvent(
      new KeyboardEvent("keydown", { code: "Enter", bubbles: true })
    );
    expect(onClose).not.toHaveBeenCalled();
    outerNode.dispatchEvent(
      new KeyboardEvent("keydown", { code: "Escape", bubbles: true })
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("accepts classnames and adds them to the wrapper", () => {
    render(
      <SlidePanel
        isActive={true}
        className="test-class"
        children={null}
        onClose={jest.fn()}
      />
    );
    expect(document.querySelector(".slide-panel")).toHaveAttribute(
      "class",
      "slide-panel test-class"
    );
  });
});
