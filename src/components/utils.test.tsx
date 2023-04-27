import {
  formatFriendlyDateToNow,
  isSet,
  copyToClipboard,
  getViewportWidth,
} from "./utils";

describe("isSet", () => {
  it("handles set values", () => {
    expect(isSet(1)).toBe(true);
    expect(isSet(0)).toBe(true);
    expect(isSet("")).toBe(true);
    expect(isSet(null)).toBe(true);
  });

  it("handles set values that are not set", () => {
    expect(isSet(undefined)).toBe(false);
  });
});

describe("getViewportWidth", () => {
  const clientWidth = document.documentElement.clientWidth;

  beforeEach(() => {
    Object.defineProperty(document.documentElement, "clientWidth", {
      value: 1000,
    });
  });

  afterEach(() => {
    if (clientWidth) {
      Object.defineProperty(
        document.documentElement,
        "clientWidth",
        clientWidth
      );
    }
  });

  it("can get the width from the document", () => {
    global.innerWidth = 900;
    expect(getViewportWidth()).toBe(1000);
  });

  it("can get the width from the window", () => {
    global.innerWidth = 1100;
    expect(getViewportWidth()).toBe(1100);
  });
});

describe("formatFriendlyDateToNow", () => {
  it("should return a human friendly time string", () => {
    const timeOneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const friendlyDate = formatFriendlyDateToNow(timeOneHourAgo);
    expect(friendlyDate).toBe("about 1 hour ago");
  });
});

describe("copyToClipboard", () => {
  const execCommand = document.execCommand;

  beforeEach(() => {
    document.execCommand = jest.fn();
  });

  afterEach(() => {
    document.execCommand = execCommand;
  });

  it("can copy to the clipboard", () => {
    copyToClipboard("copycat");
    expect(document.execCommand).toHaveBeenCalledWith("copy");
  });
});
