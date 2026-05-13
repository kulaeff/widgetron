import type { Spec } from "@json-render/react";
import { describe, expect, it } from "vitest";
import type { CatalogComponentInfo } from "./utils/catalog-data";
import type { Version } from "./types";
import {
  addCatalogComponentToVersions,
  buildSpecTreeItems,
  moveElementInSpec,
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

  it("creates the first version when dropping a catalog component into an empty project", () => {
    const result = addCatalogComponentToVersions({
      component: components[2],
      nextVersionId: "v1",
      targetElementId: "preview",
      versions: [],
    });

    expect(result.selectedVersionId).toBe("v1");
    expect(result.nextElementKey).toBe("root-button");
    expect(result.versions).toEqual([
      {
        id: "v1",
        prompt: "xxx",
        raw: [],
        spec: {
          root: "root-button",
          elements: {
            "root-button": {
              type: "Button",
              props: {
                disabled: false,
                label: "New Button",
              },
            },
          },
        },
        status: "complete",
        usage: null,
      },
    ]);
  });

  it("adds duplicate catalog components with unique keys and default props", () => {
    const versions: Version[] = [
      {
        id: "v1",
        prompt: "existing",
        raw: [],
        spec: {
          root: "root",
          elements: {
            root: {
              type: "Stack",
              props: {},
              children: ["button"],
            },
            button: {
              type: "Button",
              props: { label: "Existing" },
            },
          },
        },
        status: "complete",
        usage: null,
      },
    ];

    const result = addCatalogComponentToVersions({
      component: components[2],
      nextVersionId: "v2",
      selectedVersionId: "v1",
      targetElementId: "root",
      versions,
    });

    expect(result.selectedVersionId).toBe("v1");
    expect(result.nextElementKey).toBe("button-2");
    expect(result.versions[0].spec?.elements.root.children).toEqual([
      "button",
      "button-2",
    ]);
    expect(result.versions[0].spec?.elements["button-2"]).toEqual({
      type: "Button",
      props: {
        disabled: false,
        label: "New Button",
      },
    });
  });

  it("adds components to preview as detached elements", () => {
    const versions: Version[] = [
      {
        id: "v1",
        prompt: "existing",
        raw: [],
        spec: {
          root: "root",
          elements: {
            root: {
              type: "Stack",
              props: {},
              children: [],
            },
          },
        },
        status: "complete",
        usage: null,
      },
    ];

    const result = addCatalogComponentToVersions({
      component: components[2],
      nextVersionId: "v2",
      selectedVersionId: "v1",
      targetElementId: "preview",
      versions,
    });

    expect(result.nextElementKey).toBe("button");
    expect(result.versions[0].spec?.elements.root.children).toEqual([]);
    expect(result.versions[0].spec?.elements.button).toEqual({
      type: "Button",
      props: {
        disabled: false,
        label: "New Button",
      },
    });
  });

  it("adds catalog components as siblings in tree order", () => {
    const versions: Version[] = [
      {
        id: "v1",
        prompt: "existing",
        raw: [],
        spec: {
          root: "root",
          elements: {
            root: {
              type: "Stack",
              props: {},
              children: ["title", "text"],
            },
            title: {
              type: "Text",
              props: { text: "Title" },
            },
            text: {
              type: "Text",
              props: { text: "Body" },
            },
          },
        },
        status: "complete",
        usage: null,
      },
    ];

    const result = addCatalogComponentToVersions({
      component: components[2],
      nextVersionId: "v2",
      placement: "after",
      selectedVersionId: "v1",
      targetElementId: "title",
      targetParentId: "root",
      versions,
    });

    expect(result.nextElementKey).toBe("button");
    expect(result.versions[0].spec?.elements.root.children).toEqual([
      "title",
      "button",
      "text",
    ]);
  });
});
