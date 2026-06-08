import type { Spec } from "@json-render/react";
import { describe, expect, it } from "vitest";
import type { CatalogComponentInfo } from "./utils/catalog-data";
import {
  addViewScreenToSpec,
  buildSpecTreeItems,
  collectViewElementIds,
  createDefaultVersion,
  moveElementInSpec,
  removeElementFromSpec,
  wrapViewAsDisplaySpec,
} from "./spec-utils";

const components: CatalogComponentInfo[] = [
  {
    name: "Stack",
    group: "layout",
    description: "Stack",
    props: [],
    slots: ["default"],
    events: [],
  },
  {
    name: "Text",
    group: "content",
    description: "Text",
    props: [{ name: "text", type: "string" }],
    slots: [],
    events: [],
  },
  {
    name: "Button",
    group: "controls",
    description: "Button",
    props: [
      { name: "label", type: "string" },
      { name: "disabled", type: "boolean" },
    ],
    slots: [],
    events: ["press"],
  },
];

describe("Editor spec utils", () => {
  it("builds a tree from root elements and appends detached nodes", () => {
    const spec: Spec = {
      root: "root",
      elements: {
        root: {
          type: "Stack",
          props: {},
          children: ["title"],
        },
        title: {
          type: "Text",
          props: { text: "Hello" },
        },
        detached: {
          type: "Button",
          props: { label: "Save" },
        },
      },
    };

    expect(buildSpecTreeItems(spec, components)).toEqual([
      {
        canDrop: true,
        children: [
          {
            canDrop: false,
            children: [],
            detached: false,
            id: "title",
            isRoot: false,
            label: "title",
            type: "Text",
          },
        ],
        detached: false,
        id: "root",
        isRoot: true,
        label: "root",
        type: "Stack",
      },
      {
        canDrop: false,
        children: [],
        detached: true,
        id: "detached",
        isRoot: false,
        label: "detached",
        type: "Button",
      },
    ]);
  });

  it("does not recurse forever on cyclic children references", () => {
    const spec: Spec = {
      root: "root",
      elements: {
        root: {
          type: "Stack",
          props: {},
          children: ["child"],
        },
        child: {
          type: "Stack",
          props: {},
          children: ["root"],
        },
      },
    };

    expect(buildSpecTreeItems(spec, components)[0].children).toEqual([
      {
        canDrop: true,
        children: [],
        detached: false,
        id: "child",
        isRoot: false,
        label: "child",
        type: "Stack",
      },
    ]);
  });

  it("does not recurse forever on detached cyclic children references", () => {
    const spec: Spec = {
      root: "",
      elements: {
        orphan: {
          type: "Stack",
          props: {},
          children: ["orphan"],
        },
      },
    };

    expect(buildSpecTreeItems(spec, components)).toEqual([
      {
        canDrop: true,
        children: [],
        detached: true,
        id: "orphan",
        isRoot: false,
        label: "orphan",
        type: "Stack",
      },
    ]);
  });

  it("moves elements inside another parent without mutating the source spec", () => {
    const spec: Spec = {
      root: "root",
      elements: {
        root: {
          type: "Stack",
          props: {},
          children: ["left", "right"],
        },
        left: {
          type: "Stack",
          props: {},
          children: ["card"],
        },
        right: {
          type: "Stack",
          props: {},
          children: ["title"],
        },
        card: {
          type: "Button",
          props: { label: "Save" },
        },
        title: {
          type: "Text",
          props: { text: "Hello" },
        },
      },
    };

    const next = moveElementInSpec(spec, {
      sourceParentId: "left",
      sourceId: "card",
      targetParentId: "right",
      targetId: "right",
      placement: "inside",
    });

    expect(next?.elements.left.children).toEqual([]);
    expect(next?.elements.right.children).toEqual(["title", "card"]);
    expect(spec.elements.left.children).toEqual(["card"]);
  });

  it("reorders elements before and after siblings in the same parent", () => {
    const spec: Spec = {
      root: "root",
      elements: {
        root: {
          type: "Stack",
          props: {},
          children: ["a", "b", "c"],
        },
        a: { type: "Text", props: { text: "A" } },
        b: { type: "Text", props: { text: "B" } },
        c: { type: "Text", props: { text: "C" } },
      },
    };

    const before = moveElementInSpec(spec, {
      sourceParentId: "root",
      sourceId: "c",
      targetParentId: "root",
      targetId: "a",
      placement: "before",
    });
    const after = moveElementInSpec(spec, {
      sourceParentId: "root",
      sourceId: "a",
      targetParentId: "root",
      targetId: "c",
      placement: "after",
    });

    expect(before?.elements.root.children).toEqual(["c", "a", "b"]);
    expect(after?.elements.root.children).toEqual(["b", "c", "a"]);
  });

  it("removes an element subtree and cleans parent references", () => {
    const spec: Spec = {
      root: "root",
      elements: {
        root: {
          type: "Stack",
          props: {},
          children: ["section", "tail"],
        },
        section: {
          type: "Stack",
          props: {},
          children: ["title", "cta"],
        },
        title: { type: "Text", props: { text: "Title" } },
        cta: { type: "Button", props: { label: "Go" } },
        tail: { type: "Text", props: { text: "Tail" } },
      },
    };

    const next = removeElementFromSpec(spec, "section");

    expect(next?.elements.section).toBeUndefined();
    expect(next?.elements.title).toBeUndefined();
    expect(next?.elements.cta).toBeUndefined();
    expect(next?.elements.root.children).toEqual(["tail"]);
    expect(next?.elements.tail).toEqual(spec.elements.tail);
  });

  it("updates root when removing the current root element", () => {
    const spec: Spec = {
      root: "root",
      elements: {
        root: { type: "Stack", props: {}, children: ["child"] },
        child: { type: "Text", props: { text: "Child" } },
        detached: { type: "Button", props: { label: "Detached" } },
      },
    };

    const next = removeElementFromSpec(spec, "root");

    expect(next?.elements.root).toBeUndefined();
    expect(next?.elements.child).toBeUndefined();
    expect(next?.root).toBe("detached");
  });

  it("collects View ids in tree order and appends detached views", () => {
    const spec: Spec = {
      root: "root-view",
      elements: {
        "root-view": {
          type: "View",
          props: {},
          children: ["nested-view"],
        },
        "nested-view": {
          type: "View",
          props: {},
          children: ["text"],
        },
        text: {
          type: "Text",
          props: { text: "Hello" },
        },
        "detached-view": {
          type: "View",
          props: {},
          children: [],
        },
      },
    };

    expect(collectViewElementIds(spec)).toEqual([
      "root-view",
      "nested-view",
      "detached-view",
    ]);
  });

  it("wraps a View subtree as a display spec with that View as root", () => {
    const spec: Spec = {
      root: "root-view",
      state: { count: 1 },
      elements: {
        "root-view": {
          type: "View",
          props: { gap: 8 },
          children: ["nested-view", "text"],
        },
        "nested-view": {
          type: "View",
          props: {},
          children: [],
        },
        text: {
          type: "Text",
          props: { text: "Hello" },
        },
        sibling: {
          type: "Button",
          props: { label: "Outside" },
        },
      },
    };

    expect(wrapViewAsDisplaySpec(spec, "nested-view")).toEqual({
      root: "nested-view",
      state: { count: 1 },
      elements: {
        "nested-view": {
          type: "View",
          props: {},
          children: [],
        },
      },
    });

    expect(wrapViewAsDisplaySpec(spec, "root-view")).toEqual({
      root: "root-view",
      state: { count: 1 },
      elements: {
        "root-view": {
          type: "View",
          props: { gap: 8 },
          children: ["nested-view", "text"],
        },
        "nested-view": {
          type: "View",
          props: {},
          children: [],
        },
        text: {
          type: "Text",
          props: { text: "Hello" },
        },
      },
    });
  });

  it("adds a detached View screen to an existing spec", () => {
    const spec: Spec = {
      root: "view-1",
      elements: {
        "view-1": {
          type: "View",
          props: {},
          children: ["text"],
        },
        text: {
          type: "Text",
          props: { text: "Hello" },
        },
      },
    };

    const { spec: nextSpec, viewId } = addViewScreenToSpec(spec);

    expect(viewId).toBe("view-2");
    expect(nextSpec.elements["view-2"]).toEqual({
      type: "View",
      props: {},
      children: [],
    });
    expect(nextSpec.root).toBe("view-1");
    expect(collectViewElementIds(nextSpec)).toEqual(["view-1", "view-2"]);
  });

  it("creates the first View screen when spec is empty", () => {
    expect(addViewScreenToSpec(null)).toEqual({
      viewId: "view-1",
      spec: {
        root: "view-1",
        elements: {
          "view-1": {
            type: "View",
            props: {},
            children: [],
          },
        },
        state: {},
      },
    });
  });

  it("creates a dev version with View as the root element", () => {
    expect(createDefaultVersion("v1")).toEqual({
      id: "v1",
      prompt: "",
      raw: [],
      spec: {
        root: "view-default",
        elements: {
          "view-default": {
            type: "View",
            props: {},
            children: [],
          },
        },
        state: {},
      },
      status: "complete",
      usage: null,
    });
  });
});
