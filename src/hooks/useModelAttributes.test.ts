import { renderHook } from "@testing-library/react";

import { modelInfoFactory as modelManagerV10ModelInfoFactory } from "testing/factories/juju/ModelManagerV10";
import { modelInfoFactory as modelManagerV11ModelInfoFactory } from "testing/factories/juju/ModelManagerV11";
import { modelDataFactory } from "testing/factories/juju/juju";

import useModelAttributes from "./useModelAttributes";

describe("useModelAttributes", () => {
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
      }),
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
          info: modelManagerV11ModelInfoFactory.build({
            "cloud-tag": "cloud-aws",
            "cloud-region": "au-east",
            qualifier: "user-eggman",
            "cloud-credential-tag": "cloudcred-amazon_eggman@external_juju",
          }),
        }),
        def456: modelDataFactory.build({
          info: modelManagerV11ModelInfoFactory.build({
            "cloud-tag": "cloud-gce",
            "cloud-region": "au-west",
            qualifier: "user-spaceman",
            "cloud-credential-tag": "cloudcred-google_spaceman@external_juju",
          }),
        }),
      }),
    );
    expect(result.current).toMatchObject({
      clouds: ["aws", "gce"],
      credentials: ["eggman", "spaceman"],
      owners: ["eggman", "spaceman"],
      regions: ["au-east", "au-west"],
    });
  });

  it("gets owners for Juju 3.6", () => {
    const { result } = renderHook(() =>
      useModelAttributes({
        abc123: modelDataFactory.build({
          info: modelManagerV10ModelInfoFactory.build({
            "owner-tag": "user-eggman",
          }),
        }),
        def456: modelDataFactory.build({
          info: modelManagerV10ModelInfoFactory.build({
            "owner-tag": "user-spaceman",
          }),
        }),
      }),
    );
    expect(result.current).toMatchObject({
      owners: ["eggman", "spaceman"],
    });
  });

  it("gets owners for Juju 4.0", () => {
    const { result } = renderHook(() =>
      useModelAttributes({
        abc123: modelDataFactory.build({
          info: modelManagerV11ModelInfoFactory.build({
            qualifier: "user-eggman",
          }),
        }),
        def456: modelDataFactory.build({
          info: modelManagerV11ModelInfoFactory.build({
            qualifier: "user-spaceman",
          }),
        }),
      }),
    );
    expect(result.current).toMatchObject({
      owners: ["eggman", "spaceman"],
    });
  });

  it("dedupes model attributes", () => {
    const { result } = renderHook(() =>
      useModelAttributes({
        abc123: modelDataFactory.build({
          info: modelManagerV11ModelInfoFactory.build({
            "cloud-tag": "cloud-aws",
            "cloud-region": "au-east",
            qualifier: "user-eggman",
            "cloud-credential-tag": "cloudcred-amazon_eggman@external_juju",
          }),
        }),
        def456: modelDataFactory.build({
          info: modelManagerV11ModelInfoFactory.build({
            "cloud-tag": "cloud-aws",
            "cloud-region": "au-east",
            qualifier: "user-eggman",
            "cloud-credential-tag": "cloudcred-amazon_eggman@external_juju",
          }),
        }),
      }),
    );
    expect(result.current).toMatchObject({
      clouds: ["aws"],
      credentials: ["eggman"],
      owners: ["eggman"],
      regions: ["au-east"],
    });
  });
});
