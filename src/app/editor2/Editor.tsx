import {
  DragDropProvider,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/react";
import { validateSpec } from "@json-render/core";
import type { Spec } from "@json-render/react";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { Input } from "@pulse/ui/components/Input";
import { IconButton } from "@pulse/ui/components/Button";
import { Loader } from "@pulse/ui/components/Loader";
import { JsonEditor, JsonValue } from "@visual-json/react";
import {
  Background,
  Node,
  NodeOrigin,
  NodeProps,
  Panel,
  ReactFlow,
  SmoothStepEdge,
  type EdgeProps,
  useNodesState,
  useEdgesState,
  useReactFlow,
  getStraightPath,
  BaseEdge,
  Edge,
} from "@xyflow/react";
import {
  CSSProperties,
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";
import { Button } from "./components/Button";
import { Island } from "./components/Island";
import {
  type LevaControl,
  type LevaControlValue,
  LevaPanel,
} from "./components/LevaPanel";
import { OmniBox } from "./components/OmniBox";
import type { OmniBoxContextTag } from "./components/OmniBox/OmniBox";
import { ToolBar } from "./components/ToolBar";
import { ToolPicker, type ToolPickerItem } from "./components/ToolPicker";
import { ZoomControl, type ZoomOption } from "./components/ZoomControl";
import { TreeView } from "./components/TreeView";
import { AutoHeightButton } from "./modules/AutoHeightButton";
import { SizeSelector } from "./modules/SizeSelector";
import { Preview, type PreviewProps } from "./modules/Preview";
import { Runtime } from "./modules/Runtime";
import { Tabs } from "./components/Tabs";
import { Item, Flex } from "./components/Flex";
import { Versions } from "./components/Versions";
import { CodeBlock } from "./components/CodeBlock";
import { VisibilityEditor } from "./components/VisibilityEditor";
import { Toggle } from "./components/Toggle";
import { Modal, ModalDescription, ModalTitle } from "./components/Modal";
import { useUIStream } from "./hooks/useUIStream";
import { catalog } from "./lib/catalog";
import { DraggingCatalogComponentPayload, Version } from "./types";
import type {
  WidgetCreatorProps,
  WidgetCreatorSavePayload,
} from "../../widgets/WidgetCreator/types";
import {
  createDefaultVersion,
  buildSpecTreeItems,
  collectViewElementIds,
  moveElementInSpec,
  removeElementFromSpec,
  addElementToSpec,
  addViewScreenToSpec,
  wrapViewAsDisplaySpec,
} from "./spec-utils";
import {
  buildCatalogData,
  type CatalogComponentInfo,
} from "./utils/catalog-data";
import * as Styled from "./styled";
import { MODE, TILE_SIZE } from "./constants";
import { buildCustomSystemRules, buildCustomUserRules } from "./rules";

interface Api {
  id: string;
  method: string;
  url: string;
  body: string;
}

const ZOOM_OPTIONS: ZoomOption[] = [
  { id: "in", label: "Zoom in" },
  { id: "out", label: "Zoom out" },
  { id: "100", label: "Zoom to 100%" },
  { id: "fit", label: "Zoom to fit" },
];

const DESIGN_TOOLS: ToolPickerItem[] = [
  { id: "select", title: "Select" },
  { id: "component", title: "Component" },
];

const FLOW_NODE_GAP = 128;

const getPreviewNodeWidth = (
  constraints: PreviewProps["constraints"]
): number => constraints?.width ?? constraints?.minWidth ?? 390;

const getViewFlowNodeId = (viewId: string) => `view:${viewId}`;

const getViewIdFromFlowNodeId = (nodeId: string) =>
  nodeId.startsWith("view:") ? nodeId.slice("view:".length) : null;

type PreviewNode = Node<PreviewProps, "renderer">;
type ElementVisibilityValue =
  | Spec["elements"][string]["visible"]
  | boolean
  | undefined;

const RendererNode: FC<NodeProps<PreviewNode>> = ({ data, dragging, selected }) => {
  return <Preview {...data} dragging={dragging} selected={selected} />;
};

type EdgeData = Edge<Record<string, never>, "customEdge">;

const CustomEdge: FC<EdgeProps<EdgeData>> = ({
  id,
  sourcePosition,
  sourceX,
  sourceY,
  targetPosition,
  targetX,
  targetY,
  label,
}) => {
  return (
    <SmoothStepEdge
      id={id}
      sourcePosition={sourcePosition}
      targetPosition={targetPosition}
      sourceX={sourceX}
      sourceY={sourceY}
      targetX={targetX}
      targetY={targetY}
      label={label}
      labelShowBg
    />
  );
};

const nodeTypes = {
  renderer: RendererNode,
};

const edgeTypes = {
  customEdge: CustomEdge,
};

export interface EditorProps extends Pick<WidgetCreatorProps, "onSave"> { }

export const Editor: FC<EditorProps> = ({ onSave }) => {
  const { t } = useTranslation();
  const { tokens, typography } = useTheme();
  const { fitView, zoomIn, zoomOut, zoomTo } = useReactFlow();

  const [activeTab, setActiveTab] = useState("elements");
  const [activeRightTab, setActiveRightTab] = useState("properties");
  const [apis, setApis] = useState<Api[]>([]);
  const [domSnapshot, setDomSnapshot] = useState("");
  const [openApiSpec, setOpenApiSpec] = useState("");
  const [dataSnapshot, setDataSnapshot] = useState("");
  const [selectedElementId, setSelectedElementId] = useState<string>();
  const [selectedViewId, setSelectedViewId] = useState<string>();
  const [selectedVersionId, setSelectedVersionId] = useState<string>();
  const [mode, setMode] = useState<string>(MODE.AI);
  const [versions, setVersions] = useState<Version[]>([]);
  const [activeTreeDropTargetId, setActiveTreeDropTargetId] = useState<
    string | null
  >(null);
  const [draggingCatalogComponentPayload, setDraggingCatalogComponentPayload] =
    useState<DraggingCatalogComponentPayload | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [selectedDesignToolId, setSelectedDesignToolId] = useState("select");
  const [tileSizeId, setTileSizeId] = useState<string>(TILE_SIZE[0].id);
  const [autoHeight, setAutoHeight] = useState(false);

  const generatingVersionIdRef = useRef<string>();
  const isSyncingFlowSelectionRef = useRef(false);
  const apiModalRef = useRef<HTMLDialogElement>(null);
  const domModalRef = useRef<HTMLDialogElement>(null);
  const openApiModalRef = useRef<HTMLDialogElement>(null);
  const dataModalRef = useRef<HTMLDialogElement>(null);

  const { actions, components, functions } = useMemo(
    () => buildCatalogData(catalog.data),
    []
  );

  const [currentVersion, currentVersionIndex] = useMemo(
    () => {
      const index = versions.findIndex((v) => v.id === selectedVersionId);

      if (index === -1) {
        return [null, 0];
      }

      return [versions[index], index];
    },
    [selectedVersionId, versions]
  );
  const selectedTileSize = useMemo(
    () => TILE_SIZE.find((viewport) => viewport.id === tileSizeId) ?? TILE_SIZE[0],
    [tileSizeId]
  );
  const viewportSize = useMemo(() => {
    if (tileSizeId === "auto") {
      return {
        minWidth: selectedTileSize.minWidth,
        minHeight: selectedTileSize.minHeight,
      };
    }

    if (autoHeight) {
      return { width: selectedTileSize.width };
    }

    return {
      width: selectedTileSize.width,
      height: selectedTileSize.height,
    };
  }, [autoHeight, tileSizeId, selectedTileSize]);

  const { isStreaming, raw, spec, usage, clear, send } = useUIStream({
    customRules: buildCustomSystemRules(),
    catalog: { actions, components, functions },
    // url: "/api-web/neurosearchbar/api/v1/gigachat/completion",
    url: "https://api.z.ai/api/paas/v4/chat/completions",
  });

  const currentSpec = currentVersion?.spec ?? spec;
  const currentSpecCode = JSON.stringify(currentSpec, null, 2);
  const currentState = currentSpec?.state;
  const currentSnapshotData = currentState?.data ?? null;
  const isSaveDisabled = isStreaming || !currentSpec;

  const activeViewId = useMemo(() => {
    const viewIds = collectViewElementIds(currentSpec);

    if (viewIds.length === 0) {
      return undefined;
    }

    if (selectedViewId && viewIds.includes(selectedViewId)) {
      return selectedViewId;
    }

    return viewIds[0];
  }, [currentSpec, selectedViewId]);

  const selectedViewSpec = useMemo(() => {
    if (!currentSpec) {
      return null;
    }

    const viewIds = collectViewElementIds(currentSpec);

    if (viewIds.length === 0) {
      return currentSpec;
    }

    const viewId = activeViewId ?? viewIds[0];

    return wrapViewAsDisplaySpec(currentSpec, viewId) ?? currentSpec;
  }, [activeViewId, currentSpec]);

  const toolBarItems = useMemo(
    () =>
      Object.groupBy(components, ({ group }) => group) as Record<
        string,
        CatalogComponentInfo[]
      >,
    [components]
  );

  const selectedElement = useMemo(() => {
    if (!selectedElementId || !currentSpec) {
      return null;
    }

    const element = currentSpec?.elements[selectedElementId];
    const component = components.find((c) => c.name === element.type);
    const controls = component
      ? component.props.map<LevaControl>((prop) => {
        const id = prop.name.replace("?", "");
        const value = element.props?.[prop.name] ?? prop.default;

        switch (prop.type) {
          case "boolean":
            return {
              id,
              label: id,
              type: "boolean",
              value,
            };
          case "number":
            return {
              id,
              label: id,
              type: "number",
              value,
            };
          case "string":
            return {
              id,
              label: id,
              type: "string",
              value,
            };
          default: {
            const options = prop.type.split("|").map((item) => item.trim());

            return {
              id,
              label: id,
              options,
              type: "select",
              value,
            };
          }
        }
      })
      : [];

    return {
      id: selectedElementId,
      type: element?.type,
      controls,
    };
  }, [components, currentSpec, selectedElementId]);

  const treeViewElementsItems = useMemo(
    () => buildSpecTreeItems(selectedViewSpec, components),
    [components, selectedViewSpec]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<PreviewNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EdgeData[]>([]);

  const handleSave = useCallback(async () => {
    const scheme = currentVersion?.spec ?? spec ?? null;

    if (!scheme || !onSave) {
      return;
    }

    const payload: WidgetCreatorSavePayload = {
      data: currentSnapshotData,
      dataSource: {
        method: apis[0]?.method ?? "GET",
        url: apis[0]?.url ?? "",
      },
      availableSizes: [tileSizeId],
      scheme,
    };

    await onSave(payload);
  }, [currentSnapshotData, currentVersion?.spec, onSave, spec, tileSizeId]);

  const handleVersionSelect = useCallback((id: string) => {
    setSelectedVersionId(id);
    setSelectedElementId(undefined);
    setSelectedViewId(undefined);
  }, []);

  const handleFlowSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: PreviewNode[] }) => {
      if (isSyncingFlowSelectionRef.current) {
        isSyncingFlowSelectionRef.current = false;
        return;
      }

      const selectedNode = selectedNodes[0];

      if (!selectedNode) {
        return;
      }

      const viewId = getViewIdFromFlowNodeId(selectedNode.id);

      if (!viewId) {
        return;
      }

      setSelectedViewId((prev) => (prev === viewId ? prev : viewId));
      setSelectedElementId((prev) => {
        if (!prev || !currentSpec) {
          return prev;
        }

        const viewSpec = wrapViewAsDisplaySpec(currentSpec, viewId);

        return viewSpec?.elements[prev] ? prev : undefined;
      });
    },
    [currentSpec]
  );

  const handleElementSelect = useCallback((viewId: string, elementId: string) => {
    setSelectedViewId(viewId);
    setSelectedElementId(elementId);
  }, []);

  const handleAddScreen = useCallback(() => {
    if (selectedVersionId) {
      let nextViewId: string | undefined;

      setVersions((prevVersions) =>
        prevVersions.map((version) => {
          if (version.id !== selectedVersionId) {
            return version;
          }

          const { spec: nextSpec, viewId } = addViewScreenToSpec(version.spec);

          nextViewId = viewId;

          return { ...version, spec: nextSpec };
        })
      );

      if (nextViewId) {
        setSelectedViewId(nextViewId);
        setSelectedElementId(nextViewId);
      }
    } else {
      const nextVersionId = Date.now().toString();
      const { spec: nextSpec, viewId } = addViewScreenToSpec(currentSpec);

      setVersions([
        {
          ...createDefaultVersion(nextVersionId),
          spec: nextSpec,
        },
      ]);
      setSelectedVersionId(nextVersionId);
      setSelectedViewId(viewId);
      setSelectedElementId(viewId);
    }

    window.setTimeout(() => {
      void fitView({
        duration: 120,
        interpolate: "smooth",
        maxZoom: 1,
        padding: 0.15,
      });
    }, 0);
  }, [currentSpec, fitView, selectedVersionId]);

  const handleModeChange = useCallback(
    (value: string) => {
      setMode(value);

      if (value !== MODE.DEV || versions.length > 0) {
        return;
      }

      const nextVersionId = Date.now().toString();

      setVersions([createDefaultVersion(nextVersionId)]);
      setSelectedVersionId(nextVersionId);
      setSelectedElementId(undefined);
    },
    [versions.length]
  );

  const handleJsonEditorChange = useCallback(
    (value: JsonValue) => {
      setVersions((p) =>
        p.map((v) => {
          if (v.id !== selectedVersionId || !v.spec) {
            return v;
          }

          return {
            ...v,
            spec: { ...v.spec, state: value as Spec["state"] },
          };
        })
      );
    },
    [selectedVersionId]
  );

  const handleLevaControlChange = useCallback(
    (id: string, value: LevaControlValue) => {
      if (!selectedElementId) return;

      setVersions((p) =>
        p.map((v) => {
          if (
            v.id !== selectedVersionId ||
            !v.spec ||
            !v.spec.elements[selectedElementId]
          ) {
            return v;
          }

          return {
            ...v,
            spec: {
              ...v.spec,
              elements: {
                ...v.spec.elements,
                [selectedElementId]: {
                  ...v.spec.elements[selectedElementId],
                  props: {
                    ...v.spec.elements[selectedElementId].props,
                    [id]: value,
                  },
                },
              },
            },
          };
        })
      );
    },
    [selectedElementId, selectedVersionId]
  );

  const handleSelectedElementRename = useCallback(
    (nextId: string) => {
      const trimmedNextId = nextId.trim();
      if (!selectedElementId || trimmedNextId.length === 0) {
        return;
      }

      setVersions((prevVersions) =>
        prevVersions.map((version) => {
          if (
            version.id !== selectedVersionId ||
            !version.spec ||
            !version.spec.elements[selectedElementId] ||
            selectedElementId === trimmedNextId ||
            version.spec.elements[trimmedNextId]
          ) {
            return version;
          }

          const nextElements = Object.fromEntries(
            Object.entries(version.spec.elements).map(([elementId, element]) => {
              const mappedId =
                elementId === selectedElementId ? trimmedNextId : elementId;
              const nextChildren = element.children?.map((childId) =>
                childId === selectedElementId ? trimmedNextId : childId
              );

              return [
                mappedId,
                {
                  ...element,
                  ...(nextChildren ? { children: nextChildren } : {}),
                },
              ];
            })
          ) as Spec["elements"];

          return {
            ...version,
            spec: {
              ...version.spec,
              root:
                version.spec.root === selectedElementId
                  ? trimmedNextId
                  : version.spec.root,
              elements: nextElements,
            },
          };
        })
      );

      setSelectedElementId(trimmedNextId);
    },
    [selectedElementId, selectedVersionId]
  );

  const handleSelectedElementVisibilityChange = useCallback(
    (value: ElementVisibilityValue) => {
      if (!selectedElementId) return;

      setVersions((prevVersions) =>
        prevVersions.map((version) => {
          if (
            version.id !== selectedVersionId ||
            !version.spec ||
            !version.spec.elements[selectedElementId]
          ) {
            return version;
          }

          const currentElement = version.spec.elements[selectedElementId];
          const nextElement = { ...currentElement };

          if (value === true || value === undefined) {
            delete nextElement.visible;
          } else {
            nextElement.visible = value as Spec["elements"][string]["visible"];
          }

          return {
            ...version,
            spec: {
              ...version.spec,
              elements: {
                ...version.spec.elements,
                [selectedElementId]: nextElement,
              },
            },
          };
        })
      );
    },
    [selectedElementId, selectedVersionId]
  );

  const handleMonacoEditorChange = (value: string | undefined) => {
    if (value) {
      try {
        const spec = JSON.parse(value) as Spec;
        const result = validateSpec(spec);

        // validateSpec only validates the spec structure, not the presence of props
        const issues = Object.entries(spec.elements)
          .filter(([, value]) => value.props === undefined)
          .map(([key]) => `${key}: missing props field`);

        if (result.valid && issues.length === 0) {
          setVersions((p) =>
            p.map((v) => (v.id === selectedVersionId ? { ...v, spec } : v))
          );
        }
      } catch (error) {
        // ignore
      }
    }
  };

  const omniBoxContextTags = useMemo<OmniBoxContextTag[]>(() => {
    const tags: OmniBoxContextTag[] = [];
    const apiCount = apis.filter((api) => api.url.trim().length > 0).length;

    if (apiCount > 0) {
      tags.push({ id: "api", label: "API", count: apiCount });
    }

    if (domSnapshot.trim()) {
      tags.push({ id: "dom", label: "DOM" });
    }

    if (openApiSpec.trim()) {
      tags.push({ id: "openapi", label: "OpenAPI" });
    }

    if (dataSnapshot.trim()) {
      tags.push({ id: "data", label: "Data" });
    }

    return tags;
  }, [apis, dataSnapshot, domSnapshot, openApiSpec]);

  const handleOmniBoxToolRequest = useCallback((id: string) => {
    switch (id) {
      case "api":
        if (!apiModalRef.current?.open) {
          apiModalRef.current?.showModal();
        }
        break;
      case "dom":
        if (!domModalRef.current?.open) {
          domModalRef.current?.showModal();
        }
        break;
      case "openapi":
        if (!openApiModalRef.current?.open) {
          openApiModalRef.current?.showModal();
        }
        break;
      case "data":
        if (!dataModalRef.current?.open) {
          dataModalRef.current?.showModal();
        }
        break;
      default:
        break;
    }
  }, []);

  const handleOmniBoxContextTagRemove = useCallback((id: string) => {
    switch (id) {
      case "api":
        setApis([]);
        apiModalRef.current?.close();
        break;
      case "dom":
        setDomSnapshot("");
        domModalRef.current?.close();
        break;
      case "openapi":
        setOpenApiSpec("");
        openApiModalRef.current?.close();
        break;
      case "data":
        setDataSnapshot("");
        dataModalRef.current?.close();
        break;
      default:
        break;
    }
  }, []);

  const handleOmniBoxSubmit = useCallback(
    async (value: string) => {
      const nextId = Date.now().toString();

      // generatingVersionIdRef.current = nextId;

      setVersions((p) => [
        ...p,
        {
          id: nextId,
          prompt: value,
          raw: [],
          spec: null,
          status: "pending",
          usage: null,
        },
      ]);

      generatingVersionIdRef.current = nextId;
      setSelectedElementId(undefined);
      setSelectedVersionId(nextId);

      let data: unknown;

      if (dataSnapshot.trim()) {
        try {
          data = JSON.parse(dataSnapshot.trim());
        } catch {
          data = dataSnapshot.trim();
        }
      } else if (apis.length > 0) {
        const promises = apis.map((api) => {
          const method = api.method.toUpperCase();

          return fetch(api.url, {
            method,
            ...(method === "POST" && api.body.trim().length > 0
              ? { body: api.body }
              : {}),
          });
        });

        const responses = await Promise.all(promises);

        data = await Promise.all(responses.map((r) => r.json()));
      }

      await send(value, {
        customRules: buildCustomUserRules(tileSizeId, autoHeight, {
          data: dataSnapshot,
          dom: domSnapshot,
          openApi: openApiSpec,
        }),
        elementID: selectedElementId,
        previousSpec: currentVersion?.spec ?? {
          root: "",
          elements: {},
          state: {
            ...(data !== undefined ? { data } : {}),
          },
        },
      });
    },
    [apis, currentVersion, dataSnapshot, domSnapshot, openApiSpec, tileSizeId, autoHeight, selectedElementId, send]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { source } = event.operation;

    if (source === null) {
      return;
    }

    const { data, element } = source;

    if (data === null || element === undefined) {
      return;
    }

    if (data.kind === "catalog.component") {
      const { height, width } = element.getBoundingClientRect();

      setDraggingCatalogComponentPayload({
        height,
        name: data.name,
        width,
      });

      setSelectedDesignToolId("select");
    } else {
      setDraggingCatalogComponentPayload(null);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { source, target } = event.operation;

      if (source === null || target === null) {
        return;
      }

      const { data: sourceData } = source;
      const { data: targetData } = target;

      if (sourceData.kind === "catalog.component" && targetData.kind === "preview.droppable") {
        const component = components.find((c) => c.name === sourceData.name);

        if (component === undefined) {
          return;
        }

        setVersions((p) =>
          p.map((v) =>
            v.id === selectedVersionId && v.spec !== null
              ? {
                ...v,
                spec: addElementToSpec(v.spec, component, targetData.elementId),
              }
              : v
          )
        );
      }

      setDraggingCatalogComponentPayload(null);
    },
    [components, selectedVersionId, versions]
  );

  const handleSizeSelectorChange = useCallback((value: string) => {
    setTileSizeId(value);
  }, [fitView]);

  const handleTreeViewElementsChange = (id: string) => {
    setSelectedElementId(id);
  };

  const handleTreeViewMove = useCallback(
    ({
      sourceParentId,
      sourceId,
      targetParentId,
      targetId,
      placement,
    }: {
      sourceParentId: string | null;
      sourceId: string;
      targetParentId: string;
      targetId: string;
      placement: "inside" | "before" | "after";
    }) => {
      setVersions((p) =>
        p.map((v) =>
          v.id === selectedVersionId
            ? {
              ...v,
              spec: moveElementInSpec(v.spec, {
                sourceParentId,
                sourceId,
                targetParentId,
                targetId,
                placement,
              }),
            }
            : v
        )
      );
    },
    [selectedVersionId]
  );

  const handleTreeViewDelete = useCallback(
    (id: string) => {
      setVersions((p) =>
        p.map((v) =>
          v.id === selectedVersionId
            ? {
              ...v,
              spec: removeElementFromSpec(v.spec, id),
            }
            : v
        )
      );

      setSelectedElementId((prev) => (prev === id ? undefined : prev));
    },
    [selectedVersionId]
  );

  useEffect(() => {
    const viewIds = collectViewElementIds(currentSpec);

    if (viewIds.length === 0) {
      setSelectedViewId(undefined);
      return;
    }

    setSelectedViewId((prev) =>
      prev && viewIds.includes(prev) ? prev : viewIds[0]
    );
  }, [currentSpec]);

  useEffect(() => {
    if (generatingVersionIdRef && !isStreaming && spec) {
      setVersions((p) =>
        p.map((v) =>
          v.id === generatingVersionIdRef.current
            ? {
              ...v,
              raw,
              spec,
              status: "complete",
              usage,
            }
            : v
        )
      );
    }
  }, [isStreaming, raw, spec, usage]);

  useEffect(() => {
    setNodes((prevNodes) => {
      const viewIds = collectViewElementIds(currentSpec);
      const targets =
        viewIds.length > 0
          ? viewIds.map((viewId) => ({ kind: "view" as const, viewId }))
          : [{ kind: "full" as const, viewId: null as string | null }];

      const nodeWidth = getPreviewNodeWidth(viewportSize);

      return targets.map((target, index) => {
        const nodeId =
          target.kind === "view" ? getViewFlowNodeId(target.viewId) : "spec-full";
        const existing = prevNodes.find((node) => node.id === nodeId);
        const displaySpec =
          target.kind === "view" && currentSpec && target.viewId
            ? wrapViewAsDisplaySpec(currentSpec, target.viewId)
            : currentSpec;

        return {
          id: nodeId,
          position:
            existing?.position ?? {
              x: index * (nodeWidth + FLOW_NODE_GAP),
              y: 0,
            },
          data: {
            constraints: viewportSize,
            loading: isStreaming,
            selectedElementID: existing?.data.selectedElementID,
            spec: displaySpec,
            viewId: target.kind === "view" ? target.viewId : undefined,
            onElementSelect: handleElementSelect,
          },
          draggable: false,
          selected: existing?.selected ?? false,
          type: "renderer",
        };
      });
    });
  }, [currentSpec, handleElementSelect, isStreaming, setNodes, viewportSize]);

  useEffect(() => {
    setNodes((prevNodes) => {
      let hasChanges = false;

      const nextNodes = prevNodes.map((node) => {
        const displaySpec = node.data.spec;
        const nextSelectedElementID =
          selectedElementId && displaySpec?.elements[selectedElementId]
            ? selectedElementId
            : undefined;

        if (node.data.selectedElementID === nextSelectedElementID) {
          return node;
        }

        hasChanges = true;

        return {
          ...node,
          data: {
            ...node.data,
            selectedElementID: nextSelectedElementID,
          },
        };
      });

      return hasChanges ? nextNodes : prevNodes;
    });
  }, [selectedElementId, setNodes]);

  useEffect(() => {
    if (!activeViewId) {
      return;
    }

    setNodes((prevNodes) => {
      let hasChanges = false;

      const nextNodes = prevNodes.map((node) => {
        const viewId = getViewIdFromFlowNodeId(node.id);

        if (!viewId) {
          return node;
        }

        const shouldSelect = viewId === activeViewId;

        if (node.selected === shouldSelect) {
          return node;
        }

        hasChanges = true;

        return {
          ...node,
          selected: shouldSelect,
        };
      });

      if (!hasChanges) {
        return prevNodes;
      }

      isSyncingFlowSelectionRef.current = true;

      return nextNodes;
    });
  }, [activeViewId, setNodes]);

  useEffect(() => {
    const viewIds = collectViewElementIds(currentSpec);

    if (viewIds.length < 2) {
      setEdges([]);
      return;
    }

    const nextEdges = viewIds.slice(1).map((viewId, index) => {
      const prevViewId = viewIds[index];

      return {
        id: `screen-chain:${prevViewId}->${viewId}`,
        source: getViewFlowNodeId(prevViewId),
        target: getViewFlowNodeId(viewId),
        type: "customEdge",
        label: viewId,
        data: {},
        selectable: false,
        deletable: false,
      };
    });

    setEdges(nextEdges);
  }, [currentSpec, setEdges]);

  useEffect(() => {
    if (mode !== MODE.DEV || selectedDesignToolId !== "component") {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (
        target.closest(
          "[data-component-picker-surface], [data-component-picker-trigger]"
        )
      ) {
        return;
      }

      setSelectedDesignToolId("select");
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedDesignToolId("select");
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mode, selectedDesignToolId]);

  useEffect(() => {
    if (!isCodeModalOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCodeModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCodeModalOpen]);

  const apiEditor = (
    <Flex vertical>
      {apis.map((api) => (
        <Item key={api.id}>
          <Flex>
            <Item>
              <Toggle
                options={[
                  { id: "get", label: "GET" },
                  { id: "post", label: "POST" },
                ]}
                value={api.method}
                onChange={(id) =>
                  setApis((p) =>
                    p.map((a) =>
                      a.id === api.id ? { ...a, method: id } : a
                    )
                  )
                }
              />
            </Item>
            <Item grow>
              <Input
                value={api.url}
                onChange={(e) =>
                  setApis((p) =>
                    p.map((a) =>
                      a.id === api.id ? { ...a, url: e.target.value } : a
                    )
                  )
                }
              />
            </Item>
            {api.method === "post" ? (
              <Item grow>
                <Input
                  placeholder={t("Тело запроса")}
                  value={api.body}
                  onChange={(e) =>
                    setApis((p) =>
                      p.map((a) =>
                        a.id === api.id ? { ...a, body: e.target.value } : a
                      )
                    )
                  }
                />
              </Item>
            ) : null}
            <Item>
              <IconButton size="m-alt" $type="tertiary">
                x
              </IconButton>
            </Item>
          </Flex>
        </Item>
      ))}
      <Item>
        <IconButton
          size="s"
          $type="secondary"
          onClick={() =>
            setApis((p) => [
              ...p,
              {
                id: Date.now().toString(),
                method: "get",
                url: "",
                body: "",
              },
            ])
          }
        >
          +
        </IconButton>
      </Item>
    </Flex>
  );

  return (
    <DragDropProvider
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <DragOverlay dropAnimation={null}>
        {draggingCatalogComponentPayload ? (
          <Styled.DragOverlayItem
            style={{
              height: draggingCatalogComponentPayload.height,
              width: draggingCatalogComponentPayload.width
            }}
          >
            {draggingCatalogComponentPayload.name}
          </Styled.DragOverlayItem>
        ) : null}
      </DragOverlay>
      <Styled.Container>
        {mode !== MODE.RUN ? (
          <ReactFlow
            fitView
            fitViewOptions={{
              maxZoom: 1,
            }}
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            panOnDrag={false}
            panOnScroll
            proOptions={{ hideAttribution: true }}
            zoomActivationKeyCode={["Control", "Meta", "z"]}
            onPaneClick={() => {
              setSelectedElementId(undefined);
            }}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onSelectionChange={handleFlowSelectionChange}
          >
            <Background />
            <Panel position="top-center">
              <Flex>
                <Item>
                  <Island unstyled>
                    <SizeSelector
                      value={tileSizeId}
                      onChange={handleSizeSelectorChange}
                    />
                  </Island>
                </Item>
                <Item>
                  <Island unstyled>
                    <AutoHeightButton
                      disabled={tileSizeId === "auto"}
                      enabled={autoHeight}
                      onChange={setAutoHeight}
                    />
                  </Island>
                </Item>
                {mode === MODE.DEV ? (
                  <Item>
                    <Island unstyled>
                      <Button
                        disabled={isStreaming}
                        label="+ Экран"
                        type="button"
                        variant="secondary"
                        onClick={handleAddScreen}
                      />
                    </Island>
                  </Item>
                ) : null}
              </Flex>
            </Panel>
            <Panel position="bottom-right" style={{ zIndex: 10 }}>
              <Island unstyled>
                <ZoomControl
                  options={ZOOM_OPTIONS}
                  onChange={(id) => {
                    if (id === "in") {
                      zoomIn({ duration: 120, interpolate: "smooth" });
                    } else if (id === "out") {
                      zoomOut({ duration: 120, interpolate: "smooth" });
                    } else if (id === "100") {
                      zoomTo(1, { duration: 120, interpolate: "smooth" });
                    } else if (id === "fit") {
                      fitView({ duration: 120, interpolate: "smooth" });
                    }
                  }}
                />
              </Island>
            </Panel>
            {mode === MODE.AI && (
              <>
                {currentVersion && currentVersion.prompt ? (
                  <Panel position="top-left">
                    <Island
                      maxHeight="calc(100vh - 327px)"
                      width={300}
                    >
                      <Styled.RailCardBody>
                        <Styled.RailHeader>
                          <Styled.RailTitle>{t("текущий запрос")}</Styled.RailTitle>
                          <Styled.RailMeta>
                            {currentVersion?.status === "pending" ? (
                              <Loader size="lg" />
                            ) : null}
                            <Styled.RailTag $tone="accent">
                              v{currentVersionIndex + 1}
                            </Styled.RailTag>
                          </Styled.RailMeta>
                        </Styled.RailHeader>
                        <Styled.PromptPreview>
                          {currentVersion.prompt}
                        </Styled.PromptPreview>
                      </Styled.RailCardBody>
                    </Island>
                  </Panel>
                ) : null}
                <Panel position="bottom-left">
                  <Island maxHeight={297} width={300}>
                    <Versions
                      disabled={isStreaming}
                      items={versions}
                      value={selectedVersionId}
                      onChange={handleVersionSelect}
                    />
                  </Island>
                </Panel>
                <Panel position="bottom-center">
                  <Modal ref={apiModalRef} id="modalApi">
                    <Flex vertical>
                      <Item>
                        <ModalTitle>{t("API")}</ModalTitle>
                        <ModalDescription>
                          {t(
                            "Укажите HTTP-эндпоинты. При отправке запроса данные будут загружены и переданы модели."
                          )}
                        </ModalDescription>
                      </Item>
                      <Item grow>{apiEditor}</Item>
                    </Flex>
                  </Modal>
                  <Modal ref={domModalRef} id="modalDom">
                    <Flex vertical>
                      <Item>
                        <ModalTitle>{t("Дерево DOM")}</ModalTitle>
                        <ModalDescription>
                          {t(
                            "Вставьте слепок DOM-дерева страницы, чтобы модель учитывала структуру разметки при генерации."
                          )}
                        </ModalDescription>
                      </Item>
                      <Item grow>
                        <Styled.SnapshotTextArea
                          placeholder={t("Вставьте слепок DOM-дерева")}
                          value={domSnapshot}
                          onChange={(e) => setDomSnapshot(e.target.value)}
                        />
                      </Item>
                    </Flex>
                  </Modal>
                  <Modal ref={openApiModalRef} id="modalOpenApi">
                    <Flex vertical>
                      <Item>
                        <ModalTitle>{t("Спецификация OpenAPI")}</ModalTitle>
                        <ModalDescription>
                          {t(
                            "Вставьте спецификацию OpenAPI — модель сможет опираться на описание методов и схем при генерации."
                          )}
                        </ModalDescription>
                      </Item>
                      <Item grow>
                        <Styled.SnapshotTextArea
                          placeholder={t("Вставьте спецификацию OpenAPI")}
                          value={openApiSpec}
                          onChange={(e) => setOpenApiSpec(e.target.value)}
                        />
                      </Item>
                    </Flex>
                  </Modal>
                  <Modal ref={dataModalRef} id="modalData">
                    <Flex vertical>
                      <Item>
                        <ModalTitle>{t("Данные")}</ModalTitle>
                        <ModalDescription>
                          {t(
                            "Вставьте пример данных в формате JSON. Они будут подставлены в state виджета при генерации."
                          )}
                        </ModalDescription>
                      </Item>
                      <Item grow>
                        <Styled.SnapshotTextArea
                          placeholder={t("Вставьте данные (JSON)")}
                          value={dataSnapshot}
                          onChange={(e) => setDataSnapshot(e.target.value)}
                        />
                      </Item>
                    </Flex>
                  </Modal>
                  <Island width={500}>
                    <OmniBox
                      loading={isStreaming}
                      contextTags={omniBoxContextTags}
                      elementTag={selectedElementId}
                      onSubmit={handleOmniBoxSubmit}
                      onReset={clear}
                      onToolRequest={handleOmniBoxToolRequest}
                      onContextTagRemove={handleOmniBoxContextTagRemove}
                    />
                  </Island>
                </Panel>
              </>
            )}
            {mode === MODE.DEV && (
              <>
                {selectedDesignToolId === "component" ? (
                  <Panel position="bottom-center" style={{ marginBottom: 70, zIndex: 200 }}>
                    <Island height={360} width="40vw">
                      <Styled.ComponentPickerSurface
                        data-component-picker-surface
                      >
                        <ToolBar items={toolBarItems} />
                      </Styled.ComponentPickerSurface>
                    </Island>
                  </Panel>
                ) : null}
                <Panel position="top-left">
                  <Island
                    maxHeight="calc(100vh - 30px)"
                    maxWidth={300}
                    minHeight={300}
                    minWidth={300}
                  >
                    <Flex vertical>
                      <Item>
                        <Tabs
                          items={[
                            { id: "elements", label: t("элементы") },
                            { id: "state", label: t("стейт") },
                            { id: "stream", label: t("поток") },
                            { id: "code", label: t("код") },
                          ]}
                          value={activeTab}
                          onChange={(id) => setActiveTab(id)}
                        />
                      </Item>
                      <Item grow>
                        {activeTab === "elements" ? (
                          <TreeView
                            activeCatalogDropTargetId={activeTreeDropTargetId}
                            items={treeViewElementsItems}
                            value={selectedElementId}
                            onChange={handleTreeViewElementsChange}
                            onItemDelete={handleTreeViewDelete}
                            onItemPositionChange={handleTreeViewMove}
                          />
                        ) : null}
                        {activeTab === "state" ? (
                          <JsonEditor
                            height="100%"
                            readOnly={isStreaming}
                            sidebarOpen={false}
                            style={
                              {
                                "--vj-bg": "transparent",
                                "--vj-bg-panel":
                                  tokens.current.core.background.default,
                                "--vj-bg-hover":
                                  tokens.current.interactive.hover.tertiary,
                                "--vj-bg-selected": tokens.current.system["30"],
                                "--vj-bg-selected-muted":
                                  tokens.current.system["20"],
                                "--vj-border": tokens.current.core.border.strong,
                                "--vj-input-font-size":
                                  typography.body1Regular.fontSize,
                                "--vj-text": tokens.current.core.text.primary,
                                "--vj-text-muted":
                                  tokens.current.core.text.secondary,
                                "--vj-text-selected":
                                  tokens.current.core.text.onColor,
                                "--vj-boolean":
                                  tokens.current.colors.green.solid["60"],
                                "--vj-number":
                                  tokens.current.colors.blue.solid["60"],
                                "--vj-string":
                                  tokens.current.colors.orange.solid["60"],
                              } as CSSProperties
                            }
                            value={currentSpec?.state as JsonValue}
                            onChange={handleJsonEditorChange}
                          />
                        ) : null}
                        {activeTab === "stream" ? (
                          <CodeBlock
                            code={currentVersion?.raw.join("\n") ?? ""}
                            fillHeight
                            lang="json"
                          />
                        ) : null}
                        {activeTab === "code" ? (
                          <Styled.CodePanel>
                            <Styled.CodeExpandButton
                              type="button"
                              aria-label={t("Развернуть код")}
                              title={t("Развернуть код")}
                              onClick={() => setIsCodeModalOpen(true)}
                            >
                              ⤢
                            </Styled.CodeExpandButton>
                            <MonacoEditor
                              language="json"
                              options={{
                                minimap: { enabled: false },
                                readOnly: isStreaming,
                              }}
                              value={currentSpecCode}
                              onChange={handleMonacoEditorChange}
                            />
                          </Styled.CodePanel>
                        ) : null}
                      </Item>
                    </Flex>
                  </Island>
                </Panel>
                <Panel position="center-right">
                  <Island width={300} height="calc(100vh - 138px)">
                    <Flex vertical>
                      <Item>
                        <Tabs
                          items={[
                            { id: "properties", label: t("свойства") },
                            { id: "visibility", label: t("видимость") },
                          ]}
                          value={activeRightTab}
                          onChange={(id) => setActiveRightTab(id)}
                        />
                      </Item>
                      <Item grow>
                        {/* eslint-disable-next-line no-nested-ternary */}
                        {activeRightTab === "properties" ? (
                          selectedElement ? (
                            <LevaPanel
                              name={selectedElement.id}
                              type={selectedElement.type}
                              controls={selectedElement.controls}
                              onNameChange={handleSelectedElementRename}
                              onControlChange={handleLevaControlChange}
                            />
                          ) : (
                            <Styled.Placeholder>
                              {t(
                                "Выберите узел дерева для редактирования его свойств"
                              )}
                            </Styled.Placeholder>
                          )
                        ) : null}
                        {activeRightTab === "visibility" ? (
                          selectedElementId && currentSpec?.elements[selectedElementId] ? (
                            <VisibilityEditor
                              value={
                                currentSpec.elements[selectedElementId]
                                  .visible as ElementVisibilityValue
                              }
                              onChange={handleSelectedElementVisibilityChange}
                            />
                          ) : (
                            <Styled.Placeholder>
                              {t(
                                "Выберите узел дерева для редактирования его видимости"
                              )}
                            </Styled.Placeholder>
                          )
                        ) : null}
                        {activeRightTab === "api" ? apiEditor : null}
                      </Item>
                    </Flex>
                  </Island>
                </Panel>
                <Panel position="bottom-center">
                  <Island unstyled>
                    <ToolPicker
                      items={toolBarItems}
                      tools={DESIGN_TOOLS}
                      value={selectedDesignToolId}
                      onSelect={setSelectedDesignToolId}
                    />
                  </Island>
                </Panel>
                {isCodeModalOpen ? (
                  <Styled.CodeModalBackdrop
                    role="presentation"
                    onMouseDown={(event) => {
                      if (event.target === event.currentTarget) {
                        setIsCodeModalOpen(false);
                      }
                    }}
                  >
                    <Styled.CodeModal
                      aria-label={t("Код спецификации")}
                      role="dialog"
                      aria-modal="true"
                    >
                      <Styled.CodeModalHeader>
                        <Styled.CodeModalTitle>
                          {t("Код спецификации")}
                        </Styled.CodeModalTitle>
                        <Button
                          type="button"
                          onClick={() => setIsCodeModalOpen(false)}
                        >
                          {t("Закрыть")}
                        </Button>
                      </Styled.CodeModalHeader>
                      <Styled.CodeModalBody>
                        <MonacoEditor
                          language="json"
                          options={{
                            readOnly: isStreaming,
                          }}
                          value={currentSpecCode}
                          onChange={handleMonacoEditorChange}
                        />
                      </Styled.CodeModalBody>
                    </Styled.CodeModal>
                  </Styled.CodeModalBackdrop>
                ) : null}
              </>
            )}
          </ReactFlow>
        ) : null}
        {mode === MODE.RUN ? (
          <Runtime
            spec={currentSpec}
            loading={isStreaming}
            size={viewportSize}
            autoHeight={tileSizeId === "auto" || autoHeight}
          />
        ) : null}
        {/* Always on top */}
        <Panel position="top-right">
          <Flex>
            <Item>
              <Island unstyled>
                <Button
                  disabled={isSaveDisabled}
                  label={t("сохранить")}
                  variant="primary"
                  onClick={handleSave}
                />
              </Island>
            </Item>
            <Item>
              <Island unstyled>
                <Toggle
                  options={[
                    { id: MODE.AI, isAccent: true, label: "AI" },
                    { id: MODE.DEV, label: "DEV" },
                    { id: MODE.RUN, label: "RUN" },
                  ]}
                  value={mode}
                  onChange={handleModeChange}
                />
              </Island>
            </Item>
          </Flex>
        </Panel>
      </Styled.Container>
    </DragDropProvider>
  );
};
