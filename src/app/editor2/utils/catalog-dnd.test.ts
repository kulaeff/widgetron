import { describe, expect, it } from "vitest";
import { catalog } from "../lib/catalog";
import { buildCatalogData } from "./catalog-data";
import type { CatalogComponentInfo } from "./catalog-data";
import {
  buildSafeDefaultProps,
  decodeCatalogDragPayload,
  encodeCatalogDragPayload,
} from "./catalog-dnd";

describe("catalog drag helpers", () => {
  it("builds safe default props from catalog field types", () => {
    const component: CatalogComponentInfo = {
      name: "Button",
      group: "controls",
      description: "Button component",
      slots: [],
      events: ["press"],
      props: [
        { name: "label", type: "string" },
        { name: "disabled?", type: "boolean" },
        { name: "count", type: "number" },
        { name: "items", type: "string[]" },
        { name: "variant", type: "primary | secondary" },
        { name: "gap", type: "0 | 1 | 2" },
        { name: "config", type: "record" },
        { name: "url", type: "string" },
        { name: "align", type: "start | center | end | stretch", default: "stretch" },
      ],
    };

    expect(buildSafeDefaultProps(component)).toEqual({
      label: "New Button",
      disabled: false,
      count: 0,
      items: [],
      variant: "primary",
      gap: 0,
      config: {},
      url: "#",
      align: "stretch",
    });
  });

  it("prefers real catalog defaults over enum first value", () => {
    const { components } = buildCatalogData(catalog.data);
    const stack = components.find((component) => component.name === "Stack");
    const grid = components.find((component) => component.name === "Grid");

    expect(stack).toBeDefined();
    expect(grid).toBeDefined();

    expect(buildSafeDefaultProps(stack as CatalogComponentInfo)).toMatchObject({
      align: "stretch",
      direction: "column",
      gap: 0,
      justify: "stretch",
    });
    expect(buildSafeDefaultProps(grid as CatalogComponentInfo)).toMatchObject({
      align: "stretch",
      gap: 0,
      justify: "stretch",
    });
  });

  it("round-trips catalog drag payloads", () => {
    const payload = { componentName: "Stack", group: "layout" };

    expect(decodeCatalogDragPayload(encodeCatalogDragPayload(payload))).toEqual(
      payload
    );
  });

  it("rejects malformed drag payloads", () => {
    expect(decodeCatalogDragPayload("not json")).toBeNull();
    expect(decodeCatalogDragPayload(JSON.stringify({ group: "layout" }))).toBeNull();
    expect(
      decodeCatalogDragPayload(
        JSON.stringify({ componentName: "Stack", group: 1 })
      )
    ).toBeNull();
  });
});
