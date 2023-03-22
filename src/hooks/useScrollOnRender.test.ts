import { renderHook } from "@testing-library/react";
import { useScrollOnRender } from "./useScrollOnRender";

describe("useScrollOnRender", () => {
  let html: HTMLHtmlElement | null;
  let scrollToSpy: jest.Mock;
  let targetNode: HTMLElement;

  beforeEach(() => {
    global.innerHeight = 500;
    html = document.querySelector("html");
    scrollToSpy = jest.fn();
    global.scrollTo = scrollToSpy;
    targetNode = document.createElement("div");
  });

  afterEach(() => {
    if (html) {
      html.scrollTop = 0;
    }
  });

  it("does not scroll if the target is on screen", () => {
    if (html) {
      html.scrollTop = 10;
    }
    const { result } = renderHook(() => useScrollOnRender());
    targetNode.getBoundingClientRect = () => ({ y: 10 } as DOMRect);
    result.current(targetNode);
    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it("scrolls if the target is off the bottom of the screen", () => {
    if (html) {
      html.scrollTop = 100;
    }
    const { result } = renderHook(() => useScrollOnRender());
    targetNode.getBoundingClientRect = () => ({ y: 1000 } as DOMRect);
    result.current(targetNode);
    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 1000,
      left: 0,
      behavior: "smooth",
    });
  });

  it("scrolls if the target is off the top of the screen", () => {
    if (html) {
      html.scrollTop = 1000;
    }
    const { result } = renderHook(() => useScrollOnRender());
    targetNode.getBoundingClientRect = () => ({ y: 10 } as DOMRect);
    result.current(targetNode);
    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 10,
      left: 0,
      behavior: "smooth",
    });
  });

  it("scrolls if the target is partially off the bottom of the screen", () => {
    if (html) {
      html.scrollTop = 100;
    }
    const { result } = renderHook(() => useScrollOnRender());
    targetNode.getBoundingClientRect = () =>
      ({ height: 400, y: 400 } as DOMRect);
    result.current(targetNode);
    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 400,
      left: 0,
      behavior: "smooth",
    });
  });
});
