import type { RenderHookResult } from "@testing-library/react";
import { renderHook } from "@testing-library/react";

import useHeaders from "./useHeaders";

function renderUseHeadersHook(
  initialProps: Parameters<
    typeof useHeaders<{ data: number }, Record<string, unknown>>
  >[0],
): RenderHookResult<ReturnType<typeof useHeaders>, typeof initialProps> {
  return renderHook(
    (props) => useHeaders<{ data: number }, Record<string, unknown>>(props),
    {
      initialProps,
    },
  );
}

describe("useHeaders", () => {
  it.for([
    ["sortable", true],
    ["not sortable", false],
  ] as const)("renders header as %s", ([_, sortable], { expect }) => {
    const toggleSort = vi.fn();

    const { result } = renderUseHeadersHook({
      sort: null,
      toggleSort,
      columns: [
        {
          key: "myColumn",
          header: "Something",
          sortable,
          map: (_data): boolean => true,
        },
      ],
    });

    expect(result.current.prefix).toBe(undefined);
    expect(result.current.headers).toHaveLength(1);
    const header = result.current.headers[0] as React.ReactElement;
    expect(header.props).toEqual(
      expect.objectContaining({ sortable, children: "Something" }),
    );
  });

  it.for(["ascending", "descending"] as const)(
    "shows sort direction %s",
    (direction, { expect }) => {
      const toggleSort = vi.fn();

      const { result } = renderUseHeadersHook({
        sort: {
          key: "myColumn",
          direction,
        },
        toggleSort,
        columns: [
          {
            key: "myColumn",
            header: "Something",
            sortable: true,
            map: (_data): boolean => true,
          },
          {
            key: "anotherColumn",
            header: "Another",
            map: (_data): boolean => true,
          },
        ],
      });

      expect(result.current.headers).toHaveLength(2);
      const headers = result.current.headers as React.ReactElement[];
      expect(headers[0].props).toEqual(
        expect.objectContaining({
          sortable: true,
          sortDirection: direction,
          children: "Something",
        }),
      );
      expect(headers[1].props).toEqual(
        expect.not.objectContaining({
          sortDirection: expect.anything(),
        }),
      );
    },
  );

  it("prefixes group by column", ({ expect }) => {
    const toggleSort = vi.fn();

    const { result } = renderUseHeadersHook({
      sort: null,
      toggleSort,
      groupBy: "myGroup",
      columns: [
        {
          key: "myColumn",
          header: "Something",
          sortable: true,
          map: (_data): boolean => true,
        },
        {
          key: "myGroup",
          header: "Some group",
          map: (_data): boolean => true,
        },
      ],
    });

    expect(result.current.prefix).not.toBe(undefined);
    expect(result.current.headers).toHaveLength(1);
    const prefixHeader = result.current.prefix as React.ReactElement;
    expect(prefixHeader.props).toEqual(
      expect.objectContaining({
        children: "Some group",
      }),
    );
    const header = result.current.headers[0] as React.ReactElement;
    expect(header.props).toEqual(
      expect.objectContaining({
        children: "Something",
      }),
    );
  });

  it("preserves rendered headers on rerender", ({ expect }) => {
    const toggleSort = vi.fn();
    const props = {
      sort: null,
      toggleSort,
      columns: [
        {
          key: "myColumn",
          header: "Something",
          sortable: true,
          map: (_data: unknown): boolean => true,
        },
        {
          key: "myGroup",
          header: "Some group",
          map: (_data: unknown): boolean => true,
        },
      ],
    };
    const { result, rerender } = renderUseHeadersHook({ ...props });

    const initialHeaders = [...result.current.headers];
    rerender({ ...props });

    expect(result.current.headers).toStrictEqual(initialHeaders);
  });
});
