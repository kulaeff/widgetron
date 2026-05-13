import { describe, expect, it } from "vitest";
import { z } from "zod";
import { buildCatalogData, parseProps } from "./catalog-data";
import { catalog } from "../lib/catalog";

describe("catalog data helpers", () => {
  it("extracts props metadata from zod schemas", () => {
    const props = parseProps(
      z.object({
        enabled: z.boolean().default(true).optional(),
        label: z.string().meta({ description: "Visible label" }),
        size: z.enum(["s", "m"]).default("m").optional(),
        tags: z.array(z.string()).optional(),
        gap: z.union([z.literal(0), z.literal(1)]).default(0).optional(),
        config: z.record(z.string(), z.unknown()).optional(),
      })
    );

    expect(props).toEqual([
      {
        default: true,
        description: null,
        name: "enabled",
        optional: true,
        type: "boolean",
      },
      {
        default: undefined,
        description: "Visible label",
        name: "label",
        optional: false,
        type: "string",
      },
      {
        default: "m",
        description: null,
        name: "size",
        optional: true,
        type: "s | m",
      },
      {
        default: undefined,
        description: null,
        name: "tags",
        optional: true,
        type: "string[]",
      },
      {
        default: 0,
        description: null,
        name: "gap",
        optional: true,
        type: "0 | 1",
      },
      {
        default: undefined,
        description: null,
        name: "config",
        optional: true,
        type: "object",
      },
    ]);
  });

  it("builds sorted display data for components, actions, and functions", () => {
    const data = {
      components: {
        Zeta: {
          group: "content",
          description: "Zeta component",
          props: z.object({ label: z.string() }),
          slots: ["default"],
          events: ["press"],
        },
        Alpha: {
          group: "layout",
          description: "Alpha component",
          props: z.object({}),
        },
      },
      actions: {
        submit: {
          description: "Submit data",
          params: z.object({ url: z.string() }),
        },
      },
      functions: {
        formatValue: {
          description: "Format value",
          params: z.object({ value: z.number() }),
        },
      },
    } as unknown as typeof catalog.data;

    const result = buildCatalogData(data);

    expect(result.components.map((item) => item.name)).toEqual([
      "Alpha",
      "Zeta",
    ]);
    expect(result.components[1]).toMatchObject({
      name: "Zeta",
      group: "content",
      description: "Zeta component",
      slots: ["default"],
      events: ["press"],
    });
    expect(result.actions).toHaveLength(1);
    expect(result.actions[0].params[0]).toMatchObject({
      name: "url",
      type: "string",
    });
    expect(result.functions).toHaveLength(1);
    expect(result.functions[0].params[0]).toMatchObject({
      name: "value",
      type: "number",
    });
  });
});
