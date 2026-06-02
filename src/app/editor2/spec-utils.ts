import type { Spec } from "@json-render/react";
import type { TreeItem } from "./components/TreeView";
import type { CatalogComponentInfo } from "./utils/catalog-data";
import type { Version } from "./types";
import { setByPath } from "@json-render/core";
import { buildSafeDefaultProps } from "./utils/catalog-dnd";

export type TreeMovePayload = {
  sourceParentId: string | null;
  sourceId: string;
  targetParentId: string;
  targetId: string;
  placement: "inside" | "before" | "after";
};

const collectDescendantIds = (
  elements: Spec["elements"],
  id: string,
  visited = new Set<string>()
): Set<string> => {
  if (visited.has(id)) {
    return visited;
  }

  visited.add(id);
  const node = elements[id];

  if (!node?.children?.length) {
    return visited;
  }

  node.children.forEach((childId) => {
    collectDescendantIds(elements, childId, visited);
  });

  return visited;
};

export const buildSpecTreeItems = (
  spec: Spec | null | undefined,
  components: CatalogComponentInfo[]
): TreeItem[] => {
  if (!spec) {
    return [];
  }

  const { elements, root } = spec;
  const visited = new Set<string>();

  const resolveNode = (
    id: string,
    detached = false,
    ancestors = new Set<string>()
  ): TreeItem | null => {
    const node = elements[id];

    if (!node) {
      return null;
    }

    if (ancestors.has(id)) {
      return null;
    }

    if (visited.has(id) && !detached) {
      return null;
    }

    if (!detached) {
      visited.add(id);
    }

    const data = components.find((component) => component.name === node.type);
    const nextAncestors = new Set(ancestors);
    nextAncestors.add(id);

    return {
      canDrop: Boolean(data && data.slots.length >= 1),
      detached,
      id,
      isRoot: !detached && id === root,
      label: id,
      type: node.type,
      children: (node.children ?? [])
        .map((childId) => resolveNode(childId, detached, nextAncestors))
        .filter(Boolean) as TreeItem[],
    };
  };

  const treeItems: TreeItem[] = [];

  if (root && root.length > 0) {
    const rootNode = resolveNode(root);
    if (rootNode) {
      treeItems.push(rootNode);
    }
  }

  const detachedItems = Object.keys(elements)
    .filter((id) => !visited.has(id))
    .map((id) => resolveNode(id, true))
    .filter(Boolean) as TreeItem[];

  return [...treeItems, ...detachedItems];
};

const getNextElementKey = (elements: Spec["elements"], name: string) => {
  const baseKey = name.toLocaleLowerCase();

  let index = 1;

  while (elements[`${baseKey}-${index}`] !== undefined) {
    index += 1;
  }

  return `${baseKey}-${index}`;
};

export const moveElementInSpec = (
  spec: Spec | null,
  {
    sourceParentId,
    sourceId,
    targetParentId,
    targetId,
    placement,
  }: TreeMovePayload
): Spec | null => {
  if (!spec || sourceId === targetId) {
    return spec;
  }

  const sourceParent = sourceParentId
    ? spec.elements[sourceParentId]
    : null;
  const targetParent = spec.elements[targetParentId];

  if (!targetParent) {
    return spec;
  }

  const sourceParentChildren = sourceParent?.children ?? [];
  const nextSourceParentChildren = sourceParentChildren.filter(
    (id) => id !== sourceId
  );
  const targetParentChildren =
    sourceParentId && sourceParentId === targetParentId
      ? nextSourceParentChildren
      : (targetParent.children ?? []);

  const nextTargetParentChildren = [...targetParentChildren];

  if (placement === "inside") {
    nextTargetParentChildren.push(sourceId);
  } else {
    const targetIndex = nextTargetParentChildren.findIndex(
      (id) => id === targetId
    );

    if (targetIndex === -1) {
      return spec;
    }

    const nextIndex = placement === "before" ? targetIndex : targetIndex + 1;

    nextTargetParentChildren.splice(nextIndex, 0, sourceId);
  }

  return {
    ...spec,
    elements: {
      ...spec.elements,
      ...(sourceParentId && sourceParent
        ? {
            [sourceParentId]: {
              ...sourceParent,
              children: nextSourceParentChildren,
            },
          }
        : {}),
      [targetParentId]: {
        ...targetParent,
        children: nextTargetParentChildren,
      },
    },
  };
};

export const addElementToSpec = (
  spec: Spec,
  component: CatalogComponentInfo,
  targetID: string
) => {
  const key = getNextElementKey(spec.elements, component.name);

  const nextSpec = { ...spec };

  setByPath(
    nextSpec,
    `/elements/${targetID}/children`,
    [...(spec.elements[targetID].children ?? []), key]
  );

  setByPath(
    nextSpec,
    `/elements/${key}`,
    {
      type: component.name,
      props: buildSafeDefaultProps(component),
      children: [],
    }
  );

  return nextSpec;
};

export const removeElementFromSpec = (
  spec: Spec | null,
  id: string
): Spec | null => {
  if (!spec || !spec.elements[id]) {
    return spec;
  }

  const idsToDelete = collectDescendantIds(spec.elements, id);
  const nextElements = Object.fromEntries(
    Object.entries(spec.elements).reduce<
      Array<[string, Spec["elements"][string]]>
    >((acc, [elementId, element]) => {
      if (idsToDelete.has(elementId)) {
        return acc;
      }

      acc.push([
        elementId,
        {
          ...element,
          ...(element.children
            ? {
                children: element.children.filter(
                  (childId) => !idsToDelete.has(childId)
                ),
              }
            : {}),
        },
      ]);

      return acc;
    }, [])
  ) as Spec["elements"];

  if (idsToDelete.has(spec.root)) {
    const nextRoot = Object.keys(nextElements)[0] ?? "";

    return {
      ...spec,
      root: nextRoot,
      elements: nextElements,
    };
  }

  return {
    ...spec,
    elements: nextElements,
  };
};

export const createDevVersion = (id: string): Version => ({
  id,
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
  },
  status: "complete",
  usage: null,
});
