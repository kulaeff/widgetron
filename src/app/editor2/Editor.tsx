import {
  DragDropProvider,
  DragOverlay,
  type DragEndEvent,
  type DragMoveEvent,
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
  useReactFlow,
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
import { ToolBar } from "./components/ToolBar";
import { ToolPicker, type ToolPickerItem } from "./components/ToolPicker";
import { ZoomControl, type ZoomOption } from "./components/ZoomControl";
import { TREE_ROOT_DROP_TARGET_ID, TreeView } from "./components/TreeView";
import { AutoHeightButton } from "./modules/AutoHeightButton";
import {
  DEFAULT_SIZE_ID,
  getSizeOption,
  SizeSelector,
  type SizeId,
} from "./modules/SizeSelector";
import { Preview, type PreviewProps } from "./modules/Preview";
import {
  PAGE_SIZE,
  TypeSelector,
  TypeSelectorValue,
  type TypeSelectorValue as ContentType,
} from "./modules/TypeSelector";
import { Runtime } from "./modules/Runtime";
import { Tabs } from "./components/Tabs";
import { Item, Flex } from "./components/Flex";
import { Versions } from "./components/Versions";
import { CodeBlock } from "./components/CodeBlock";
import { VisibilityEditor } from "./components/VisibilityEditor";
import { Toggle } from "./components/Toggle";
import { Modal } from "./components/Modal";
import { useUIStream } from "./hooks/useUIStream";
import { catalog } from "./lib/catalog";
import { Version } from "./types";
import type {
  WidgetCreatorProps,
  WidgetCreatorSavePayload,
} from "../../widgets/WidgetCreator/types";
import {
  addCatalogComponentToVersions,
  createDevVersion,
  buildSpecTreeItems,
  moveElementInSpec,
  removeElementFromSpec,
} from "./spec-utils";
import {
  buildCatalogData,
  type CatalogComponentInfo,
} from "./utils/catalog-data";
import * as Styled from "./styled";

interface Api {
  id: string;
  method: string;
  url: string;
  body: string;
}

const EDITOR_RULES = [
  "Никогда не используй Card как потомка View.",
  "Оборачивай каждый повторяющийся элемент в Card с border:true и shadow:false для визуального разделения и лучшего UI/UX. В качестве контейнера для таких элементов используй Stack или Grid.",
  "Придерживайся визуальной иерархии элементов — используй контейнеры (Card, Stack, Grid...) для группировки элементов по смыслу.",
  // "Предпочитай Stack со свойством `direction: column` всегда, когда это возможно.",
  "Никогда не используй Title в качестве первого вложенного элемента у root элемента.",
  "Семплы данных должны быть на русском языке.",
  "При выводе радио-кнопок в цикле, используй Stack с direction:column в качестве контейнера.",
];

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

const Mode = {
  AI: "ai",
  DEV: "dev",
  RUN: "run",
} as const;

type PreviewNode = Node<PreviewProps, "renderer">;
type ElementVisibilityValue =
  | Spec["elements"][string]["visible"]
  | boolean
  | undefined;

const RendererNode: FC<NodeProps<PreviewNode>> = ({ data, selected }) => {
  return <Preview {...data} selected={selected} />;
};

const nodeTypes = {
  renderer: RendererNode,
};

export interface EditorProps extends Pick<WidgetCreatorProps, "onSave"> { }

export const Editor: FC<EditorProps> = ({ onSave }) => {
  const { t } = useTranslation();
  const { tokens, typography } = useTheme();
  const { fitView, zoomIn, zoomOut, zoomTo } = useReactFlow();

  const [activeTab, setActiveTab] = useState("elements");
  const [activeRightTab, setActiveRightTab] = useState("properties");
  const [apis, setApis] = useState<Api[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string>();
  const [selectedVersionId, setSelectedVersionId] = useState<string>();
  const [mode, setMode] = useState<string>(Mode.AI);
  const [versions, setVersions] = useState<Version[]>([]);
  const [activeTreeDropTargetId, setActiveTreeDropTargetId] = useState<
    string | null
  >(null);
  const [draggedCatalogComponentName, setDraggedCatalogComponentName] =
    useState<string | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [selectedDesignToolId, setSelectedDesignToolId] = useState("select");
  const [contentType, setContentType] = useState<ContentType>(
    TypeSelectorValue.WIDGET
  );
  const [viewportId, setViewportId] = useState<SizeId>(DEFAULT_SIZE_ID);
  const [autoHeight, setAutoHeight] = useState(false);
  const isWidgetType = contentType === TypeSelectorValue.WIDGET;

  const generatingVersionIdRef = useRef<string>();
  const apiModalRef = useRef<HTMLDialogElement>(null);

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
  const selectedViewport = useMemo(
    () => getSizeOption(viewportId),
    [viewportId]
  );
  const viewportSize = useMemo(() => {
    if (!isWidgetType) {
      return {
        width: PAGE_SIZE.maxWidth,
        minWidth: PAGE_SIZE.minWidth,
        minHeight: PAGE_SIZE.minHeight,
        maxWidth: PAGE_SIZE.maxWidth,
      };
    }

    if (autoHeight) {
      return { width: selectedViewport.width };
    }

    return {
      width: selectedViewport.width,
      height: selectedViewport.height,
    };
  }, [autoHeight, isWidgetType, selectedViewport]);

  const { isStreaming, raw, spec, usage, clear, send } = useUIStream({
    customRules: [
      ...EDITOR_RULES,
      ...(isWidgetType ? [`Текущий размер страницы: ${selectedViewport.width}x${selectedViewport.height}.`] : []),
    ],
    catalog: { actions, components, functions },
    // url: "/api-web/neurosearchbar/api/v1/gigachat/completion",
    url: "https://api.z.ai/api/paas/v4/chat/completions",
  });

  const currentSpec = currentVersion?.spec ?? spec;
  const currentSpecCode = JSON.stringify(currentSpec, null, 2);
  const currentState = currentSpec?.state;
  const currentSnapshotData = currentState?.data ?? null;
  const isSaveDisabled = isStreaming || !currentSpec;

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
    () => buildSpecTreeItems(currentSpec, components),
    [components, currentSpec]
  );

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
      availableSizes: [viewportId],
      scheme,
    };

    await onSave(payload);
  }, [currentSnapshotData, currentVersion?.spec, onSave, spec, viewportId]);

  const handleVersionSelect = useCallback((id: string) => {
    setSelectedVersionId(id);
    setSelectedElementId(undefined);
  }, []);

  const handleModeChange = useCallback(
    (value: string) => {
      setMode(value);

      if (value !== Mode.DEV || versions.length > 0) {
        return;
      }

      const nextVersionId = Date.now().toString();

      setVersions([createDevVersion(nextVersionId)]);
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

  const handleOmniBoxToolRequest = useCallback((id: string) => {
    switch (id) {
      case "api":
        if (!apiModalRef.current?.open) {
          apiModalRef.current?.showModal();
        }
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

      let data: Array<Record<string, unknown>> | null = null;

      if (apis.length > 0) {
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
        previousSpec: currentVersion?.spec ?? {
          root: "",
          elements: {},
          state: {
            data: data ?? undefined
          },
        },
      });
    },
    [apis, currentVersion, send]
  );

  const handlePreviewDropComponent = useCallback(
    (
      targetElementId: string,
      componentName: string,
      options: {
        placement?: "inside" | "before" | "after";
        targetParentId?: string | null;
      } = {}
    ) => {
      const component = components.find((c) => c.name === componentName);

      if (!component) return;

      const result = addCatalogComponentToVersions({
        component,
        placement: options.placement,
        selectedVersionId,
        targetParentId: options.targetParentId,
        targetElementId,
        versions,
      });

      if (!result.nextElementKey) {
        return;
      }

      setVersions(result.versions);
      setSelectedVersionId(result.selectedVersionId);
      setSelectedElementId(result.nextElementKey);
    },
    [components, selectedVersionId, versions]
  );

  const resolveTreeDropTargetFromNativeEvent = (
    event?: Event
  ): {
    placement: "inside" | "before" | "after";
    targetElementId: string;
    targetParentId?: string | null;
  } | null => {
    if (!(event instanceof MouseEvent || event instanceof PointerEvent)) {
      return null;
    }

    const element = document.elementFromPoint(event.clientX, event.clientY);
    const treeElement = element?.closest<HTMLElement>("[data-tree-element-id]");

    if (!treeElement) {
      return element?.closest("[data-tree-root-drop-zone]")
        ? { placement: "inside", targetElementId: "preview" }
        : null;
    }

    const targetElementId = treeElement.dataset.treeElementId;

    if (!targetElementId) {
      return null;
    }

    const bounds = treeElement.getBoundingClientRect();
    const offsetY = event.clientY - bounds.top;
    const threshold = bounds.height / 3;
    const canDropInside = treeElement.dataset.treeCanDrop === "true";
    const targetParentId = treeElement.dataset.treeParentId || null;
    let placement: "inside" | "before" | "after" = "inside";

    if (offsetY < threshold) {
      placement = "before";
    } else if (offsetY > bounds.height - threshold) {
      placement = "after";
    } else if (!canDropInside) {
      placement = "after";
    }

    if (placement !== "inside" && !targetParentId) {
      return { placement: "inside", targetElementId: "preview" };
    }

    return { placement, targetElementId, targetParentId };
  };

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.operation.source?.data;

    if (data?.kind === "catalog-component") {
      setDraggedCatalogComponentName(data.componentName);
      setSelectedDesignToolId("select");
    } else {
      setDraggedCatalogComponentName(null);
    }

    setActiveTreeDropTargetId(null);
  }, []);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const sourceData = event.operation.source?.data;

    if (sourceData?.kind !== "catalog-component") {
      return;
    }

    const treeDropTarget = resolveTreeDropTargetFromNativeEvent(
      event.nativeEvent
    );

    if (treeDropTarget?.targetElementId === "preview") {
      setActiveTreeDropTargetId(TREE_ROOT_DROP_TARGET_ID);
      return;
    }

    if (treeDropTarget?.targetElementId) {
      setActiveTreeDropTargetId(treeDropTarget.targetElementId);
      return;
    }

    setActiveTreeDropTargetId(null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const sourceData = event.operation.source?.data;

      if (sourceData?.kind === "catalog-component") {
        const treeDropTarget = resolveTreeDropTargetFromNativeEvent(
          event.nativeEvent
        );

        if (treeDropTarget) {
          handlePreviewDropComponent(
            treeDropTarget.targetElementId,
            sourceData.componentName as string,
            {
              placement: treeDropTarget.placement,
              targetParentId: treeDropTarget.targetParentId,
            }
          );
        }
      }

      setDraggedCatalogComponentName(null);
      setActiveTreeDropTargetId(null);
    },
    [handlePreviewDropComponent]
  );

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

  const currentNodes = [
    {
      id: "n1",
      position: { x: 0, y: 0 },
      data: {
        emptyLabel:
          mode === Mode.AI
            ? "Ожидание генерации интерфейса..."
            : "Перетащите сюда компонент из палитры",
        loading: isStreaming,
        selectedElementId,
        spec: currentSpec,
        viewportSize,
      },
      draggable: false,
      origin: [0.5, 0.5] as NodeOrigin,
      selectable: false,
      type: "renderer",
    },
  ];

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
    if (mode !== Mode.DEV || selectedDesignToolId !== "component") {
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
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <DragOverlay>
        {draggedCatalogComponentName ? (
          <Styled.DragOverlayItem>
            {draggedCatalogComponentName}
          </Styled.DragOverlayItem>
        ) : null}
      </DragOverlay>
      <Styled.Container>
        {mode !== Mode.RUN ? (
          <ReactFlow
            fitView
            fitViewOptions={{
              maxZoom: 1,
            }}
            nodes={currentNodes}
            nodeTypes={nodeTypes}
            panOnDrag={false}
            panOnScroll
            proOptions={{ hideAttribution: true }}
            zoomActivationKeyCode={["Control", "Meta", "z"]}
          >
            <Background />
            <Panel position="top-center">
              <Flex>
                <Item>
                  <Island unstyled>
                    <TypeSelector
                      value={contentType}
                      onChange={setContentType}
                    />
                  </Island>
                </Item>
                {isWidgetType ? (
                  <>
                    <Item>
                      <Island unstyled>
                        <SizeSelector
                          value={viewportId}
                          onChange={setViewportId}
                        />
                      </Island>
                    </Item>
                    <Item>
                      <Island unstyled>
                        <AutoHeightButton
                          enabled={autoHeight}
                          onChange={setAutoHeight}
                        />
                      </Island>
                    </Item>
                  </>
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
            {mode === Mode.AI && (
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
                      <Item grow>
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
                                            a.id === api.id
                                              ? { ...a, body: e.target.value }
                                              : a
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
                      </Item>
                    </Flex>
                  </Modal>
                  <Island width={500}>
                    <OmniBox
                      loading={isStreaming}
                      placeholder="Что вы хотите изменить или создать?"
                      onSubmit={handleOmniBoxSubmit}
                      onReset={clear}
                      onToolRequest={handleOmniBoxToolRequest}
                    />
                  </Island>
                </Panel>
              </>
            )}
            {mode === Mode.DEV && (
              <>
                {selectedDesignToolId === "component" ? (
                  <Panel position="bottom-center" style={{ marginBottom: 70 }}>
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
        {mode === Mode.RUN ? (
          <Runtime
            spec={currentSpec}
            loading={isStreaming}
            size={viewportSize}
            autoHeight={!isWidgetType || autoHeight}
          />
        ) : null}
        {/* Always on top */}
        <Panel position="top-right">
          <Flex>
            <Item>
              <Island unstyled>
                <Button
                  $type="primary"
                  disabled={isSaveDisabled}
                  label={t("сохранить")}
                  onClick={handleSave}
                />
              </Island>
            </Item>
            <Item>
              <Island unstyled>
                <Toggle
                  options={[
                    { id: Mode.AI, isAccent: true, label: "AI" },
                    { id: Mode.DEV, label: "DEV" },
                    { id: Mode.RUN, label: "RUN" },
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
