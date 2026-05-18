import type { Spec } from "@json-render/react";
import type { TreeItem } from "./components/TreeView";
import { buildSafeDefaultProps } from "./utils/catalog-dnd";
import type { CatalogComponentInfo } from "./utils/catalog-data";
import type { Version } from "./types";

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

const createCatalogElementKey = (
  componentName: string,
  elements: Spec["elements"]
): string => {
  const baseKey = componentName.toLocaleLowerCase();

  if (!elements[baseKey]) {
    return baseKey;
  }

  let index = 2;

  while (elements[`${baseKey}-${index}`]) {
    index += 1;
  }

  return `${baseKey}-${index}`;
};

export const addCatalogComponentToVersions = ({
  component,
  nextVersionId,
  placement = "inside",
  selectedVersionId,
  targetParentId,
  targetElementId,
  versions,
}: {
  component: CatalogComponentInfo;
  nextVersionId: string;
  placement?: "inside" | "before" | "after";
  selectedVersionId?: string;
  targetParentId?: string | null;
  targetElementId: string;
  versions: Version[];
}): {
  nextElementKey: string;
  selectedVersionId: string;
  versions: Version[];
} => {
  const defaultProps = buildSafeDefaultProps(component);

  if (versions.length === 0) {
    const nextElementKey = `root-${component.name.toLocaleLowerCase()}`;

    return {
      nextElementKey,
      selectedVersionId: nextVersionId,
      versions: [
        {
          id: nextVersionId,
          prompt: "xxx",
          raw: [],
          spec: {
            root: nextElementKey,
            elements: {
              [nextElementKey]: {
                type: component.name,
                props: defaultProps,
              },
            },
          },
          status: "complete",
          usage: null,
        },
      ],
    };
  }

  let nextElementKey = "";

  const nextVersions = versions.map((version) => {
    if (version.id !== selectedVersionId || !version.spec) {
      return version;
    }

    nextElementKey = createCatalogElementKey(
      component.name,
      version.spec.elements
    );

    const targetElement = version.spec.elements[targetElementId];

    if (targetElementId !== "preview" && !targetElement) {
      nextElementKey = "";
      return version;
    }

    const targetParent =
      targetParentId && placement !== "inside"
        ? version.spec.elements[targetParentId]
        : null;

    if (placement !== "inside" && !targetParent) {
      return {
        ...version,
        spec: {
          ...version.spec,
          elements: {
            ...version.spec.elements,
            [nextElementKey]: {
              type: component.name,
              props: defaultProps,
            },
          },
        },
      };
    }

    const targetParentChildren = targetParent?.children ?? [];
    const targetIndex = targetParentChildren.findIndex(
      (id) => id === targetElementId
    );
    const nextSiblingChildren =
      placement === "inside" || !targetParent
        ? []
        : [...targetParentChildren];

    if (placement !== "inside" && targetIndex === -1) {
      nextElementKey = "";
      return version;
    }

    if (placement !== "inside") {
      nextSiblingChildren.splice(
        placement === "before" ? targetIndex : targetIndex + 1,
        0,
        nextElementKey
      );
    }

    return {
      ...version,
      spec: {
        ...version.spec,
        elements: {
          ...version.spec.elements,
          [nextElementKey]: {
            type: component.name,
              props: defaultProps,
            },
          ...(targetElementId === "preview" || placement !== "inside"
            ? {}
            : {
                [targetElementId]: {
                  ...targetElement,
                  children: [
                    ...(targetElement?.children ?? []),
                    nextElementKey,
                  ],
                },
              }),
          ...(targetParent && placement !== "inside"
            ? {
                [targetParentId as string]: {
                  ...targetParent,
                  children: nextSiblingChildren,
                },
              }
            : {}),
        },
      },
    };
  });

  return {
    nextElementKey,
    selectedVersionId: selectedVersionId ?? nextVersionId,
    versions: nextVersions,
  };
};
