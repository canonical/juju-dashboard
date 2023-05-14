import { renderHook } from "@testing-library/react";

import {
  modelDataFactory,
  modelDataInfoFactory,
} from "testing/factories/juju/juju";

import useModelAttributes from "./useModelAttributes";

describe("useModelAttributes", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("handles no model data", () => {
    const { result } = renderHook(() => useModelAttributes(null));
    expect(result.current).toMatchObject({
      clouds: [],
      credentials: [],
      owners: [],
      regions: [],
    });
  });

  it("handles no model info", () => {
    const { result } = renderHook(() =>
      useModelAttributes({
        abc123: modelDataFactory.build({ info: undefined }),
      })
    );
    expect(result.current).toMatchObject({
      clouds: [],
      credentials: [],
      owners: [],
      regions: [],
    });
  });

  it("returns model attributes", () => {
    const { result } = renderHook(() =>
      useModelAttributes({
        abc123: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "cloud-tag": "cloud-aws",
            "cloud-region": "au-east",
            "owner-tag": "user-eggman",
            "cloud-credential-tag": "cloudcred-amazon_eggman@external_juju",
          }),
        }),
        def456: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "cloud-tag": "cloud-gce",
            "cloud-region": "au-west",
            "owner-tag": "user-spaceman",
            "cloud-credential-tag": "cloudcred-google_spaceman@external_juju",
          }),
        }),
      })
    );
    expect(result.current).toMatchObject({
      clouds: ["aws", "gce"],
      credentials: ["eggman", "spaceman"],
      owners: ["eggman", "spaceman"],
      regions: ["au-east", "au-west"],
    });
  });

  it("dedupes model attributes", () => {
    const { result } = renderHook(() =>
      useModelAttributes({
        abc123: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "cloud-tag": "cloud-aws",
            "cloud-region": "au-east",
            "owner-tag": "user-eggman",
            "cloud-credential-tag": "cloudcred-amazon_eggman@external_juju",
          }),
        }),
        def456: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "cloud-tag": "cloud-aws",
            "cloud-region": "au-east",
            "owner-tag": "user-eggman",
            "cloud-credential-tag": "cloudcred-amazon_eggman@external_juju",
          }),
        }),
      })
    );
    expect(result.current).toMatchObject({
      clouds: ["aws"],
      credentials: ["eggman"],
      owners: ["eggman"],
      regions: ["au-east"],
    });
  });
});
