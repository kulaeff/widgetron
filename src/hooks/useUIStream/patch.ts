import type { JsonPatch, UIElement } from "@json-render/core";
import type { Spec } from "@json-render/react";

const cloneState = (state: Spec["state"]): Spec["state"] => {
  if (!state) return undefined;

  return structuredClone(state);
};

const removeByPath = (obj: Record<string, unknown>, path: string) => {
  const segments = path.split("/").filter(Boolean);

  let current: Record<string, unknown> | unknown[] = obj;

  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i];

    if (Array.isArray(current)) {
      const index = parseInt(segment, 10);

      if (current[index] !== undefined) {
        current = current[index] as Record<string, unknown> | unknown[];
      }
    } else if (segment in current) {
      current = current[segment] as Record<string, unknown> | unknown[];
    }
  }

  const lastSegment = segments[segments.length - 1];

  if (Array.isArray(current)) {
    const index = parseInt(lastSegment, 10);

    current.splice(index, 1);
  } else {
    delete current[lastSegment];
  }
};

const setByPath = (
  obj: Record<string, unknown>,
  path: string,
  value: unknown
) => {
  const segments = path.split("/").filter(Boolean);

  let current: Record<string, unknown> | unknown[] = obj;

  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i];
    const nextSegment = segments[i + 1];
    const isNextSegmentNumeric =
      nextSegment !== undefined && !Number.isNaN(Number(nextSegment));

    if (Array.isArray(current)) {
      const index = parseInt(segment, 10);

      if (current[index] === undefined) {
        current[index] = isNextSegmentNumeric ? [] : {};
      }

      current = current[index] as Record<string, unknown> | unknown[];
    } else {
      if (!(segment in current)) {
        current[segment] = isNextSegmentNumeric ? [] : {};
      }

      current = current[segment] as Record<string, unknown> | unknown[];
    }
  }

  const lastSegment = segments[segments.length - 1];

  if (Array.isArray(current)) {
    const index = parseInt(lastSegment, 10);

    current[index] = value;
  } else {
    current[lastSegment] = value;
  }
};

const setSpecValue = (spec: Spec, path: string, value: unknown) => {
  if (path === "/root") {
    spec.root = value as string;
    return;
  }

  if (path.startsWith("/elements/")) {
    const key = path.slice(10);

    spec.elements[key] = value as UIElement;
    return;
  }

  if (path.startsWith("/state/")) {
    if (!spec.state) {
      spec.state = {};
    }

    const statePath = path.slice(6);

    setByPath(spec.state, statePath, value);
  }
};

const removeSpecValue = (spec: Spec, path: string) => {
  if (path === "/state") {
    delete spec.state;
    return;
  }

  if (path.startsWith("/state/") && spec.state) {
    const pathToRemove = path.slice(7);

    removeByPath(spec.state, pathToRemove);
    return;
  }

  if (path.startsWith("/elements/")) {
    const parts = path.slice(10).split("/");
    const elementKey = parts[0];

    delete spec.elements[elementKey];
  }
};

export const applySpecPatch = (spec: Spec, patch: JsonPatch): Spec => {
  const nextSpec = {
    ...spec,
    elements: { ...spec.elements },
    ...(spec.state ? { state: cloneState(spec.state) } : {}),
  };

  switch (patch.op) {
    case "add":
    case "replace":
      setSpecValue(nextSpec, patch.path, patch.value);
      break;
    case "remove":
      removeSpecValue(nextSpec, patch.path);
      break;
    default:
      return spec;
  }

  return nextSpec;
};
