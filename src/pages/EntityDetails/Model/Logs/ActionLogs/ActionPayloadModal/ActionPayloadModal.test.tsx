import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import * as componentUtils from "components/utils";
import { renderComponent } from "testing/utils";

import ActionPayloadModal from "./ActionPayloadModal";
import { Label } from "./types";

vi.mock("components/utils", async () => {
  const utils = await vi.importActual("components/utils");
  return {
    ...utils,
    copyToClipboard: vi.fn(),
  };
});

describe("ActionPayloadModal", () => {
  const mockPayload = { key1: "value1", test: 123 };

  it("should return empty fragment if payload is null", () => {
    const {
      result: { container },
    } = renderComponent(
      <ActionPayloadModal payload={null} onClose={vi.fn()} />,
    );
    expect(container.tagName).toBe("DIV");
    expect(container.children.length).toBe(1);
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it("should display action payload modal if payload is not null", async () => {
    renderComponent(
      <ActionPayloadModal payload={mockPayload} onClose={vi.fn()} />,
    );
    const actionPayloadModal = screen.getByTestId("action-payload-modal");
    expect(actionPayloadModal).toBeInTheDocument();
    expect(
      within(actionPayloadModal).getByRole("dialog", { name: Label.TITLE }),
    ).toBeInTheDocument();
    const codeSnippetLines = document.querySelectorAll(".p-code-snippet__line");
    expect(codeSnippetLines).toHaveLength(4);
    expect(codeSnippetLines[0]).toHaveTextContent("{");
    expect(codeSnippetLines[1]).toHaveTextContent('"key1": "value1",');
    expect(codeSnippetLines[2]).toHaveTextContent('"test": 123');
    expect(codeSnippetLines[3]).toHaveTextContent("}");
  });

  it("should copy the payload to clipboard", async () => {
    renderComponent(
      <ActionPayloadModal payload={mockPayload} onClose={vi.fn()} />,
    );
    await userEvent.click(screen.getByRole("button", { name: Label.COPY }));
    expect(componentUtils.copyToClipboard).toHaveBeenCalledWith(`{
  "key1": "value1",
  "test": 123
}`);
  });

  it("should close the modal", async () => {
    const onClose = vi.fn();
    renderComponent(
      <ActionPayloadModal payload={mockPayload} onClose={onClose} />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Close active modal" }),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });
});
