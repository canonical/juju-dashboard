import { formatFriendlyDateToNow } from "./utils";

describe("formatFriendlyDateToNow", () => {
  it("should return a human friendly time string", () => {
    const timeOneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const friendlyDate = formatFriendlyDateToNow(timeOneHourAgo);
    expect(friendlyDate).toBe("about 1 hour ago");
  });
});
