import breakLines from "./breakLines";

describe("breakLines", () => {
  it("handles null text value", () => {
    expect(breakLines(null, true, 15)).toBe("");
  });

  it("handles lines that are the exact expected length", () => {
    expect(
      breakLines("Lorem ipsum dolor sit amet, consectetur adipiscing"),
    ).toBe("Lorem ipsum dolor sit amet, consectetur adipiscing");
  });

  it("handles lines with trailing whitespace", () => {
    expect(
      breakLines("Lorem ipsum dolor sit amet, consectetur adipiscing "),
    ).toBe("Lorem ipsum dolor sit amet, consectetur adipiscing");
  });

  it("breaks words at the desired length", () => {
    expect(
      breakLines(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore",
      ),
    ).toBe(
      "Lorem ipsum dolor sit amet, consectetur adipiscing \nelit, sed do eiusmod tempor incididunt ut labore",
    );
  });

  it("handles extra whitespace at the line break", () => {
    expect(
      breakLines(
        "Lorem ipsum dolor sit amet, consectetur adipiscing   elit, sed do eiusmod tempor incididunt ut labore",
      ),
    ).toBe(
      "Lorem ipsum dolor sit amet, consectetur adipiscing \nelit, sed do eiusmod tempor incididunt ut labore",
    );
  });

  it("breaks at the previous word break for longer lines", () => {
    expect(
      breakLines(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore",
      ),
    ).toBe(
      "Lorem ipsum dolor sit amet, consectetur adipiscing \nelit, sed do eiusmod tempor incididunt ut labore",
    );
  });

  it("handles no whitespace", () => {
    expect(
      breakLines(
        "LoremIpsumDolorSitAmetConsecteturAdipiscingElitSedDoEiusmodTemporIncididuntUtLaboreEtDoloreMagnaAliqua",
      ),
    ).toBe(
      "LoremIpsumDolorSitAmetConsecteturAdipiscingElitSedDo \nEiusmodTemporIncididuntUtLaboreEtDoloreMagnaAliqua",
    );
  });

  it("handles no whitespace within the line limit", () => {
    expect(
      breakLines(
        "LoremIpsumDolorSitAmetConsecteturAdipiscingElitSedDoEiusmodTemporIncididunt utLaboreEtDoloreMagnaAliqua",
      ),
    ).toBe(
      "LoremIpsumDolorSitAmetConsecteturAdipiscingElitSedDo \nEiusmodTemporIncididunt utLaboreEtDoloreMagnaAliqua",
    );
  });

  it("handles breaking mid word", () => {
    expect(
      breakLines(
        "LoremIpsumDolorSitAmetConsecteturAdipiscingElitSedDoEiusmodTemporIncididuntUtLaboreEtDoloreMagnaAliqua",
        false,
      ),
    ).toBe(
      "LoremIpsumDolorSitAmetConsecteturAdipiscingElitSedDo \nEiusmodTemporIncididuntUtLaboreEtDoloreMagnaAliqua",
    );
  });

  it("handles whitespace at the breakpoint", () => {
    expect(
      breakLines(
        "LoremIpsumDolorSitAmetConsecteturAdipiscingElitSedDo eiusmodTemporIncididuntUtLaboreEtDoloreMagnaAliqua",
        false,
      ),
    ).toBe(
      "LoremIpsumDolorSitAmetConsecteturAdipiscingElitSedDo \neiusmodTemporIncididuntUtLaboreEtDoloreMagnaAliqua",
    );
  });

  it("can break at a provided length", () => {
    expect(breakLines("Lorem ipsum dolor sit amet", true, 15)).toBe(
      "Lorem ipsum \ndolor sit amet",
    );
  });
});
