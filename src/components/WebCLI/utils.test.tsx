import { getBlocks, getColumns, getHeaders } from "./utils";

// spell-checker:ignore mhook

describe("getBlocks", () => {
  it("extracts blocks", () => {
    expect(
      getBlocks([
        "units",
        "1",
        "2",
        "",
        // This extra empty line should get ignored.
        "",
        "machines",
        "3",
        "",
        "apps",
        "",
        "relations",
        "4",
        "5",
        "6",
      ]),
    ).toStrictEqual([
      { header: "units", rows: ["1", "2"] },
      { header: "machines", rows: ["3"] },
      { header: "apps", rows: [] },
      { header: "relations", rows: ["4", "5", "6"] },
    ]);
  });
});

describe("getHeaders", () => {
  it("extracts header columns", () => {
    expect(
      getHeaders(
        "Model  Controller           Cloud Region         Version    SLA          Timestamp",
      ),
    ).toStrictEqual([
      {
        content: "Model  ",
        ansiTitle: "Model",
        title: "Model",
        start: 0,
        end: 7,
      },
      {
        content: "Controller           ",
        ansiTitle: "Controller",
        title: "Controller",
        start: 8,
        end: 28,
      },
      {
        content: "Cloud Region         ",
        ansiTitle: "Cloud Region",
        title: "Cloud Region",
        start: 29,
        end: 49,
      },
      {
        content: "Version    ",
        ansiTitle: "Version",
        title: "Version",
        start: 50,
        end: 60,
      },
      {
        content: "SLA          ",
        ansiTitle: "SLA",
        title: "SLA",
        start: 61,
        end: 73,
      },
      {
        content: "Timestamp",
        ansiTitle: "Timestamp",
        title: "Timestamp",
        start: 74,
      },
    ]);
  });

  it("extracts header columns that contain ansi codes", () => {
    expect(
      JSON.stringify(
        getHeaders(
          "\u001b[1; 39mApp                       \u001b[0m\u001b[1; 39mVersion  \u001b[0m\u001b[1; 39mStatus   \u001b[0m\u001b[1; 39mScale  \u001b[0m\u001b[1; 39mCharm                     \u001b[0m\u001b[1; 39mChannel  \u001b[0m\u001b[1; 39mRev  \u001b[0m\u001b[1; 39mExposed  \u001b[0m\u001b[1; 39mMessage\u001b[0m",
        ),
      ),
    ).toStrictEqual(
      JSON.stringify([
        {
          content: "\u001b[1;39mApp                       \u001b[0m",
          ansiTitle: "\u001b[1;39mApp\u001b[0m",
          title: "App",
          start: 0,
          end: 26,
        },
        {
          content: "\u001b[1;39mVersion  \u001b[0m",
          ansiTitle: "\u001b[1;39mVersion\u001b[0m",
          title: "Version",
          start: 27,
          end: 35,
        },
        {
          content: "\u001b[1;39mStatus   \u001b[0m",
          ansiTitle: "\u001b[1;39mStatus\u001b[0m",
          title: "Status",
          start: 36,
          end: 44,
        },
        {
          content: "\u001b[1;39mScale  \u001b[0m",
          ansiTitle: "\u001b[1;39mScale\u001b[0m",
          title: "Scale",
          start: 45,
          end: 51,
        },
        {
          content: "\u001b[1;39mCharm                     \u001b[0m",
          ansiTitle: "\u001b[1;39mCharm\u001b[0m",
          title: "Charm",
          start: 52,
          end: 77,
        },
        {
          content: "\u001b[1;39mChannel  \u001b[0m",
          ansiTitle: "\u001b[1;39mChannel\u001b[0m",
          title: "Channel",
          start: 78,
          end: 86,
        },
        {
          content: "\u001b[1;39mRev  \u001b[0m",
          ansiTitle: "\u001b[1;39mRev\u001b[0m",
          title: "Rev",
          start: 87,
          end: 91,
        },
        {
          content: "\u001b[1;39mExposed  \u001b[0m",
          ansiTitle: "\u001b[1;39mExposed\u001b[0m",
          title: "Exposed",
          start: 92,
          end: 100,
        },
        {
          content: "\u001b[1;39mMessage\u001b[0m",
          ansiTitle: "\u001b[1;39mMessage\u001b[0m",
          title: "Message",
          start: 101,
        },
      ]),
    );
  });
});

describe("getColumns", () => {
  it("extracts columns using the header", () => {
    expect(
      getColumns(
        [
          "k8s    localhost-localhost  localhost/localhost  3.2-beta3  unsupported  05:42:48Z (UTC)",
        ],
        getHeaders(
          "Model  Controller           Cloud Region         Version    SLA          Timestamp",
        ),
      ),
    ).toStrictEqual([
      [
        {
          key: "Model",
          content: "k8s    ",
          ansiValue: "k8s",
          value: "k8s",
          whitespaceAfter: "    ",
        },
        {
          key: "Controller",
          content: "localhost-localhost  ",
          ansiValue: "localhost-localhost",
          value: "localhost-localhost",
          whitespaceAfter: "  ",
        },
        {
          key: "Cloud Region",
          content: "localhost/localhost  ",
          ansiValue: "localhost/localhost",
          value: "localhost/localhost",
          whitespaceAfter: "  ",
        },
        {
          key: "Version",
          content: "3.2-beta3  ",
          ansiValue: "3.2-beta3",
          value: "3.2-beta3",
          whitespaceAfter: "  ",
        },
        {
          key: "SLA",
          content: "unsupported  ",
          ansiValue: "unsupported",
          value: "unsupported",
          whitespaceAfter: "  ",
        },
        {
          key: "Timestamp",
          content: "05:42:48Z (UTC)",
          ansiValue: "05:42:48Z (UTC)",
          value: "05:42:48Z (UTC)",
        },
      ],
    ]);
  });

  it("handles whitespace at the start of columns", () => {
    expect(
      getColumns(
        ["  k8s   localhost-localhost                       3.2-beta3  "],
        getHeaders("Models  Controller           Cloud Region         Version"),
      ),
    ).toStrictEqual([
      [
        {
          key: "Models",
          content: "  k8s   ",
          ansiValue: "k8s",
          value: "k8s",
          whitespaceBefore: "  ",
          whitespaceAfter: "   ",
        },
        {
          key: "Controller",
          content: "localhost-localhost  ",
          ansiValue: "localhost-localhost",
          value: "localhost-localhost",
          whitespaceAfter: "  ",
        },
        {
          // It should also handle this empty column.
          key: "Cloud Region",
          content: "                     ",
          ansiValue: "",
          value: "",
          whitespaceBefore: "                     ",
        },
        {
          key: "Version",
          content: "3.2-beta3  ",
          ansiValue: "3.2-beta3",
          value: "3.2-beta3",
          whitespaceAfter: "  ",
        },
      ],
    ]);
  });

  it("extracts columns that contain ansi codes", () => {
    expect(
      getColumns(
        [
          'calico                    3.21.4   \u001b[31merror        \u001b[0m2  calico                    stable    \u001b[33m87  \u001b[0mno       \u001b[37mhook failed: "config-changed"\u001b[0m',
        ],
        getHeaders(
          "\u001b[1; 39mApp                       \u001b[0m\u001b[1; 39mVersion  \u001b[0m\u001b[1; 39mStatus   \u001b[0m\u001b[1; 39mScale  \u001b[0m\u001b[1; 39mCharm                     \u001b[0m\u001b[1; 39mChannel  \u001b[0m\u001b[1; 39mRev  \u001b[0m\u001b[1; 39mExposed  \u001b[0m\u001b[1; 39mMessage\u001b[0m",
        ),
      ),
    ).toStrictEqual([
      [
        {
          key: "App",
          content: "calico                    ",
          ansiValue: "calico",
          value: "calico",
          whitespaceAfter: "                    ",
        },
        {
          key: "Version",
          content: "3.21.4   ",
          ansiValue: "3.21.4",
          value: "3.21.4",
          whitespaceAfter: "   ",
        },
        {
          key: "Status",
          content: "\u001b[31merror    \u001b[39m",
          ansiValue: "\u001b[31merror\u001b[39m",
          value: "error",
          whitespaceAfter: "    ",
        },
        {
          key: "Scale",
          content: "\u001b[31m    \u001b[0m2  ",
          ansiValue: "\u001b[31m\u001b[0m2",
          value: "2",
          whitespaceBefore: "    ",
          whitespaceAfter: "  ",
        },
        {
          key: "Charm",
          content: "calico                    ",
          ansiValue: "calico",
          value: "calico",
          whitespaceAfter: "                    ",
        },
        {
          key: "Channel",
          content: "stable   ",
          ansiValue: "stable",
          value: "stable",
          whitespaceAfter: "   ",
        },
        {
          key: "Rev",
          content: " \u001b[33m87  \u001b[39m",
          ansiValue: "\u001b[33m87\u001b[39m",
          value: "87",
          whitespaceBefore: " ",
          whitespaceAfter: "  ",
        },
        {
          key: "Exposed",
          content: "no       ",
          ansiValue: "no",
          value: "no",
          whitespaceAfter: "       ",
        },
        {
          key: "Message",
          content: '\u001b[37mhook failed: "config-changed"\u001b[0m',
          ansiValue: '\u001b[37mhook failed: "config-changed"\u001b[0m',
          value: 'hook failed: "config-changed"',
        },
      ],
    ]);
  });
});
