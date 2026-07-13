import type { RenderHookResult } from "@testing-library/react";
import { renderHook } from "@testing-library/react";

import InlineCheckbox from "components/InlineCheckbox";
import Table from "components/Table";

import useRows from "./useRows";

function renderUseRowsHook(
  initialProps: Parameters<
    typeof useRows<{ data: number }, string, Record<string, unknown>>
  >[0],
): RenderHookResult<ReturnType<typeof useRows>, typeof initialProps> {
  return renderHook(
    (props) =>
      useRows<{ data: number }, string, Record<string, unknown>>(props),
    {
      initialProps,
    },
  );
}

const HOOK_DEFAULTS = {
  rows: [],
  columns: [
    { key: "value", header: null, map: vi.fn() },
    { key: "otherValue", header: null, map: vi.fn() },
  ],
  sort: null,
  select: {
    toggle: vi.fn(),
    toggleAll: vi.fn(),
    selected: [],
    state: "none",
  },
  selectable: false,
} as Parameters<typeof renderUseRowsHook>[0];

function createProps(
  rows: {
    key: string;
    value: number;
    otherValue: boolean;
  }[],
  overrides?: Partial<typeof HOOK_DEFAULTS>,
): Parameters<typeof renderUseRowsHook>[0] {
  return {
    ...HOOK_DEFAULTS,
    ...(overrides ?? {}),
    rows: rows.map((row) => ({
      key: row.key,
      values: [
        {
          column: "value",
          value: row.value,
        },
        {
          column: "otherValue",
          value: row.otherValue,
        },
      ],
      data: { data: 123 },
    })),
  };
}

describe("useRows", () => {
  it("generates a row with key for each data", () => {
    const { result } = renderUseRowsHook(
      createProps([
        {
          key: "abc123",
          value: 123,
          otherValue: true,
        },
        {
          key: "def456",
          value: 456,
          otherValue: false,
        },
      ]),
    );

    expect(result.current).toEqual([
      expect.objectContaining({ key: "abc123" }),
      expect.objectContaining({ key: "def456" }),
    ]);
  });

  it.for([
    ["adds", true],
    ["doesn't add", false],
  ] as const)("%s checkbox if selectable", ([_, selectable], { expect }) => {
    const { result } = renderUseRowsHook(
      createProps([{ key: "abc123", value: 123, otherValue: true }], {
        selectable,
      }),
    );

    expect(result.current.length).toEqual(1);
    const row = result.current[0] as React.ReactElement<{
      children: React.ReactNode[];
    }>;
    const [childPrefix, childSelectable, _cells] = row.props.children;
    expect(childPrefix).toEqual(null);
    if (selectable) {
      expect(childSelectable).toEqual(
        expect.objectContaining({
          type: Table.Cell,
          props: expect.objectContaining({
            children: expect.objectContaining({
              type: InlineCheckbox,
            }),
          }),
        }),
      );
    } else {
      expect(childSelectable).toEqual(null);
    }
  });

  it("moves group column to prefix", ({ expect }) => {
    const { result } = renderUseRowsHook(
      createProps(
        [
          {
            key: "abc123",
            value: 123,
            otherValue: true,
          },
        ],
        { groupBy: "value" },
      ),
    );

    expect(result.current.length).toEqual(1);
    const row = result.current[0] as React.ReactElement<{
      children: React.ReactNode[];
    }>;
    const [childPrefix, childSelectable, _cells] = row.props.children;
    expect(childPrefix).toEqual(
      expect.objectContaining({
        type: Table.Cell,
        props: expect.objectContaining({
          rowSpan: 1,
        }),
      }),
    );
    expect(childSelectable).toEqual(null);
  });
});
