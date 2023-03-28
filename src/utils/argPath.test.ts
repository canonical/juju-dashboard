import { argPath } from "./argPath";

describe("argPath", () => {
  it("can handle a URL parameter", () => {
    const urls = {
      machine: argPath<{ id: number }>("/machine/:id"),
    };
    expect(urls.machine({ id: 99 })).toBe("/machine/99");
  });

  it("can get the unmodified URL with parameters", () => {
    const urls = {
      machine: argPath<{ id: number }>("/machine/:id"),
    };
    expect(urls.machine(null)).toBe("/machine/:id");
  });

  it("can create a relative url", () => {
    const urls = {
      machine: argPath<{ id: number }>("/machine/details/:id"),
    };
    expect(urls.machine({ id: 99 }, "/machine")).toBe("details/99");
  });

  it("can create a relative url with parameters", () => {
    const urls = {
      machine: argPath<{ id: number }>("/machine/:id/details"),
    };
    expect(urls.machine(null, "/machine/:id")).toBe("details");
  });

  it("can create a relative url that has a trailing slash", () => {
    const urls = {
      machine: argPath<{ id: number }>("/machine/details/:id"),
    };
    expect(urls.machine({ id: 99 }, "/machine/")).toBe("details/99");
  });

  it("can create a relative url that does not have a trailing slash", () => {
    const urls = {
      machine: argPath<{ id: number }>("/machine/details/:id"),
    };
    expect(urls.machine({ id: 99 }, "/machine")).toBe("details/99");
  });

  it("can handle a relative url that matches the generated URL with a trailing slash", () => {
    const urls = {
      machine: argPath<{ id: number }>("/machine/:id"),
    };
    expect(urls.machine({ id: 99 }, "/machine/99/")).toBe("");
  });

  it("can handle a relative url that matches the generated URL without a trailing slash", () => {
    const urls = {
      machine: argPath<{ id: number }>("/machine/:id"),
    };
    expect(urls.machine({ id: 99 }, "/machine/99")).toBe("");
  });

  it("does not replace more than once instance of the base url", () => {
    const urls = {
      machine: argPath<{ id: number }>("/machine/details/machine/:id"),
    };
    expect(urls.machine({ id: 99 }, "/machine")).toBe("details/machine/99");
  });
});
