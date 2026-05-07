import type { JsonPatch } from "@json-render/core";
import type { Spec } from "@json-render/react";
import { describe, expect, it } from "vitest";
import { applySpecPatch } from "./patch";

describe("applySpecPatch", () => {
  it("adds root and whole elements from JSON Patch operations", () => {
    const spec: Spec = {
      root: "",
      elements: {},
    };

    const withRoot = applySpecPatch(spec, {
      op: "add",
      path: "/root",
      value: "main",
    });
    const withElement = applySpecPatch(withRoot, {
      op: "add",
      path: "/elements/main",
      value: {
        type: "Stack",
        props: { gap: 2 },
        children: ["title"],
      },
    });

    expect(withElement).toEqual({
      root: "main",
      elements: {
        main: {
          type: "Stack",
          props: { gap: 2 },
          children: ["title"],
        },
      },
    });
    expect(spec).toEqual({ root: "", elements: {} });
  });

  it("creates nested state objects and arrays from JSON pointer paths", () => {
    const spec: Spec = {
      root: "main",
      elements: {
        main: { type: "Stack", props: {} },
      },
    };

    const patches: JsonPatch[] = [
      { op: "add", path: "/state/posts", value: [] },
      {
        op: "add",
        path: "/state/posts/0/title",
        value: "First post",
      },
      {
        op: "add",
        path: "/state/posts/1/title",
        value: "Second post",
      },
      {
        op: "add",
        path: "/state/user/name",
        value: "Anna",
      },
    ];

    const next = patches.reduce(
      (current, patch) => applySpecPatch(current, patch),
      spec
    );

    expect(next.state).toEqual({
      posts: [{ title: "First post" }, { title: "Second post" }],
      user: { name: "Anna" },
    });
    expect(spec.state).toBeUndefined();
  });

  it("replaces values without mutating the source spec", () => {
    const spec: Spec = {
      root: "main",
      elements: {
        main: { type: "Text", props: { text: "Old" } },
      },
      state: {
        posts: [{ title: "Old title" }],
      },
    };

    const next = applySpecPatch(spec, {
      op: "replace",
      path: "/state/posts/0/title",
      value: "New title",
    });

    expect(next.state).toEqual({
      posts: [{ title: "New title" }],
    });
    expect(spec.state).toEqual({
      posts: [{ title: "Old title" }],
    });
  });

  it("removes state paths and whole elements", () => {
    const spec: Spec = {
      root: "main",
      elements: {
        main: { type: "Stack", props: {}, children: ["title"] },
        title: { type: "Text", props: { text: "Hello" } },
      },
      state: {
        posts: [{ title: "First" }, { title: "Second" }],
      },
    };

    const withoutPost = applySpecPatch(spec, {
      op: "remove",
      path: "/state/posts/0",
    });
    const withoutElement = applySpecPatch(withoutPost, {
      op: "remove",
      path: "/elements/title",
    });

    expect(withoutElement.state).toEqual({
      posts: [{ title: "Second" }],
    });
    expect(withoutElement.elements).toEqual({
      main: { type: "Stack", props: {}, children: ["title"] },
    });
    expect(spec.elements).toHaveProperty("title");
  });

  it("returns the original spec for unsupported operations", () => {
    const spec: Spec = {
      root: "main",
      elements: {
        main: { type: "Stack", props: {} },
      },
    };

    const next = applySpecPatch(spec, {
      op: "move",
      from: "/elements/main",
      path: "/elements/copy",
    });

    expect(next).toBe(spec);
  });
});
