import * as Styled from "./styled";
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
import { JsonEditor, JsonValue } from "@visual-json/react";
import { Input } from "@pulse/ui/components/Input";
import { IconButton } from "@pulse/ui/components/Button";
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
import { Preview, type PreviewProps } from "./components/Preview";
import { useUIStream } from "./hooks/useUIStream";
import { OmniBox } from "./components/OmniBox";
import { ToolBar } from "./components/ToolBar";
import { ToolPicker, type ToolPickerItem } from "./components/ToolPicker";
import { ZoomControl, type ZoomOption } from "./components/ZoomControl";
import { TREE_ROOT_DROP_TARGET_ID, TreeView } from "./components/TreeView";
import { catalog } from "./lib/catalog";
import {
  buildCatalogData,
  type CatalogComponentInfo,
} from "./utils/catalog-data";
import { type LevaControl, LevaPanel } from "./components/LevaPanel";
import { Tabs } from "./components/Tabs";
import { Item, Flex } from "./components/Flex";
import { Versions } from "./components/Versions";
import { CodeBlock } from "./components/CodeBlock";
import { Version } from "./types";
import type {
  WidgetCreatorProps,
  WidgetCreatorSavePayload,
} from "../../widgets/WidgetCreator/types";
import {
  addCatalogComponentToVersions,
  buildSpecTreeItems,
  moveElementInSpec,
} from "./spec-utils";
import { Toggle } from "./components/Toggle";
import { Loader } from "@pulse/ui/components/Loader";

interface Api {
  id: string;
  method: string;
  url: string;
}

const EDITOR_RULES = [
  "Никогда не используй Card как root.",
  "Оборачивай каждый повторяющийся элемент в Card с border:true и shadow:false для визуального разделения и лучшего UI/UX. В качестве контейнера для таких элементов используй Stack или Grid.",
  "Придерживайся визуальной иерархии элементов — используй контейнеры (Card, Stack, Grid...) для группировки элементов по смыслу.",
  "Предпочитай Stack со свойством `direction: column` всегда, когда это возможно.",
  "Никогда не используй Title в качестве первого вложенного элемента у root элемента.",
  "Семплы данных должны быть на русском языке.",
  "При выводе радио-кнопок в цикле, используй Stack с direction:column в качестве контейнера.",
];

const DEFAULT_SPEC = {
  root: "stack-root",
  elements: {
    "stack-root": {
      type: "Stack",
      props: {
        direction: "column",
      },
      children: ["text-1", "text-2", "stack-extra"],
    },
    "text-1": {
      type: "Text",
      props: {
        text: { $state: "/user/name" },
      },
    },
    "text-2": {
      type: "Text",
      props: {
        text: { $state: "/user/age" },
      },
    },
    "stack-extra": {
      type: "Stack",
      props: {},
      children: ["button-submit"],
    },
    "button-submit": {
      type: "Button",
      props: {
        label: "save",
      },
      on: {
        press: {
          action: "setState",
          params: {
            statePath: "test",
            value: "test",
          },
        },
      },
    },
  },
  state: {
    user: {
      name: "John Doe",
      age: 30,
      isActive: true,
      tasks: [
        {
          id: 1,
          title: "Task 1",
        },
        {
          id: 2,
          title: "Task 2",
        },
      ],
    },
  },
};

const VIEWPORT_OPTIONS = [
  { id: "minor", label: "SM", width: 294, height: 280 },
  { id: "important", label: "MD", width: 612, height: 280 },
  { id: "major", label: "LG", width: 612, height: 612 },
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
  DESIGN: "design",
} as const;

type PreviewNode = Node<PreviewProps, "renderer">;

const RendererNode: FC<NodeProps<PreviewNode>> = ({ data, selected }) => {
  return <Preview {...data} selected={selected} />;
};

const nodeTypes = {
  renderer: RendererNode,
};

export interface EditorProps extends Pick<WidgetCreatorProps, "onSave"> {}

export const Editor: FC<EditorProps> = ({ onSave }) => {
  const { t } = useTranslation();
  const { tokens, typography } = useTheme();
  const { fitView, zoomIn, zoomOut, zoomTo } = useReactFlow();

  const [activeTab, setActiveTab] = useState("elements");
  const [activeTabData, setActiveTabData] = useState("api");
  const [activeRightTab, setActiveRightTab] = useState("properties");
  const [apis, setApis] = useState<Api[]>([]);
  const [isToolDataVisible, setIsToolDataVisible] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string>();
  const [selectedVersionId, setSelectedVersionId] = useState<string>();
  const [state, setState] = useState<Record<string, unknown>>({});
  const [type, setType] = useState("");
  const [mode, setMode] = useState<string>(Mode.AI);
  const [versions, setVersions] = useState<Version[]>([{ id: "1", prompt: "test", spec: DEFAULT_SPEC, status: "pending" }, { id: "2", prompt: "test", spec: DEFAULT_SPEC, status: "pending" }, { id: "3", prompt: "test", spec: DEFAULT_SPEC, status: "pending" }, { id: "4", prompt: "test", spec: DEFAULT_SPEC, status: "pending" }, { id: "5", prompt: "test", spec: DEFAULT_SPEC, status: "pending" }]);
  const [activeDropTargetId, setActiveDropTargetId] = useState<string | null>(
    null
  );
  const [activeTreeDropTargetId, setActiveTreeDropTargetId] = useState<
    string | null
  >(null);
  const [draggedCatalogComponentName, setDraggedCatalogComponentName] =
    useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [selectedDesignToolId, setSelectedDesignToolId] = useState("select");
  const [viewportId, setViewportId] = useState(VIEWPORT_OPTIONS[0].id);

  const generatingVersionIdRef = useRef<string>();

  const { actions, components, functions } = useMemo(
    () => buildCatalogData(catalog.data),
    []
  );

  const { isStreaming, raw, spec, usage, clear, send } = useUIStream({
    customRules: EDITOR_RULES.concat(
      type.length > 0 ? `Стейт должен иметь следующую структуру: ${type}.` : ""
    ).filter(Boolean),
    catalog: { actions, components, functions },
    // url: "/api-web/neurosearchbar/api/v1/gigachat/completion",
    url: "https://api.z.ai/api/paas/v4/chat/completions",
  });

  const currentVersion = useMemo(
    () => versions.find((v) => v.id === selectedVersionId),
    [selectedVersionId, versions]
  );
  const selectedViewport = useMemo(
    () =>
      VIEWPORT_OPTIONS.find((option) => option.id === viewportId) ??
      VIEWPORT_OPTIONS[0],
    [viewportId]
  );

  const currentSpec = currentVersion?.spec ?? spec;
  const currentSpecCode = JSON.stringify(currentSpec, null, 2);
  const currentState = {
    ...(currentVersion?.spec?.state ?? spec?.state),
    ...state,
  };
  const currentSnapshotData = currentState.data ?? null;
  const currentVersionNumber = currentVersion
    ? versions.findIndex((version) => version.id === currentVersion.id) + 1
    : null;
  const currentVersionLabel = currentVersionNumber
    ? `v${currentVersionNumber}`
    : "без версии";
  const currentPromptLabel = currentVersion?.prompt?.trim() ?? "";
  const hasCurrentPrompt = currentPromptLabel.length > 0;
  const currentStatusLabel =
    isStreaming || currentVersion?.status === "pending"
      ? "генерация"
      : currentVersion
      ? "готово"
      : "черновик";
  const hasApiData = currentSnapshotData !== null;
  const historyPreviewLabel = hasCurrentPrompt
    ? currentPromptLabel
    : versions.length > 0
    ? "Выбрать версию"
    : "История пуста";
  const isSaveDisabled = isStreaming || !currentSpec;

  const currentNodes = [
    {
      id: "n1",
      position: { x: 0, y: 0 },
      data: {
        activeDropTargetId: draggedCatalogComponentName
          ? activeDropTargetId
          : null,
        emptyLabel:
          mode === Mode.AI
            ? "Ожидание генерации интерфейса..."
            : "Перетащите сюда компонент из палитры",
        loading: isStreaming,
        viewportSize: selectedViewport,
        selectedElementId,
        spec: currentSpec,
        state: currentState,
        setState,
      },
      draggable: false,
      origin: [0.5, 0.5] as NodeOrigin,
      selectable: false,
      type: "renderer",
    },
  ];

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
                value: typeof value === "boolean" ? value : false,
              };
            case "number":
              return {
                id,
                label: id,
                type: "number",
                value: typeof value === "number" ? value : 0,
              };
            case "string":
              return {
                id,
                label: id,
                type: "string",
                value: typeof value === "string" ? value : "",
              };
            default: {
              const options = prop.type.split("|").map((item) => item.trim());

              return {
                id,
                label: id,
                options,
                type: "select",
                value: typeof value === "string" ? value : "",
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
    setIsHistoryOpen(false);
  }, []);

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
    (id: string, value: string | number | boolean) => {
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

  const handleOmniBoxToolRequest = useCallback(() => {
    setIsToolDataVisible((p) => !p);
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
        const promises = apis.map((api) =>
          fetch(api.url, { method: api.method })
        );

        const responses = await Promise.all(promises);

        data = await Promise.all(responses.map((r) => r.json()));
      }

      await send(value, {
        data: data && data.length > 1 ? data : data?.[0],
        previousSpec: currentVersion?.spec,
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

      const nextVersionId = Date.now().toString();
      const result = addCatalogComponentToVersions({
        component,
        nextVersionId,
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

  const resolveDropTargetFromOperation = (
    target:
      | DragMoveEvent["operation"]["target"]
      | DragEndEvent["operation"]["target"]
  ): string | null => {
    const targetId = target?.id;

    return typeof targetId === "string" ? targetId : null;
  };

  const resolveDropTargetFromNativeEvent = (event?: Event): string | null => {
    if (!(event instanceof MouseEvent || event instanceof PointerEvent)) {
      return null;
    }

    const hoveredElement = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-element-id]");

    return hoveredElement?.getAttribute("data-element-id") ?? null;
  };

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

    setActiveDropTargetId(null);
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
      setActiveDropTargetId(null);
      setActiveTreeDropTargetId(TREE_ROOT_DROP_TARGET_ID);
      return;
    }

    if (treeDropTarget?.targetElementId) {
      setActiveDropTargetId(null);
      setActiveTreeDropTargetId(treeDropTarget.targetElementId);
      return;
    }

    const resolvedTargetId =
      resolveDropTargetFromOperation(event.operation.target) ??
      resolveDropTargetFromNativeEvent(event.nativeEvent);

    if (!resolvedTargetId) {
      setActiveDropTargetId(null);
      setActiveTreeDropTargetId(null);
      return;
    }

    setActiveTreeDropTargetId(null);
    setActiveDropTargetId(resolvedTargetId);
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
        } else {
          const resolvedTargetId =
            resolveDropTargetFromOperation(event.operation.target) ??
            resolveDropTargetFromNativeEvent(event.nativeEvent);

          if (!resolvedTargetId) {
            setDraggedCatalogComponentName(null);
            setActiveDropTargetId(null);
            setActiveTreeDropTargetId(null);
            return;
          }

          handlePreviewDropComponent(
            resolvedTargetId,
            sourceData.componentName as string
          );
        }
      }

      setDraggedCatalogComponentName(null);
      setActiveDropTargetId(null);
      setActiveTreeDropTargetId(null);
    },
    [handlePreviewDropComponent]
  );

  const handlePreviewStateChange = useCallback(
    (changes: Array<{ path: string; value: unknown }>) => {
      setState((prev) => {
        const next = { ...prev };

        for (let i = 0; i < changes.length; i += 1) {
          const { path, value } = changes[i];
          const parts = path.split("/");
          let current: Record<string, unknown> = next;
          for (let i = 0; i < parts.length - 1; i += 1) {
            const part = parts[i]!;
            if (!(part in current) || typeof current[part] !== "object") {
              current[part] = {};
            }
            current = current[part] as Record<string, unknown>;
          }
          const lastPart = parts[parts.length - 1]!;
          current[lastPart] = value;
        }
        return next;
      });
    },
    []
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

  useEffect(() => {
    if (generatingVersionIdRef && !isStreaming && spec) {
      setVersions((p) =>
        p.map((v) =>
          v.id === generatingVersionIdRef.current
            ? {
                ...v,
                raw,
                spec: { ...spec, state: { ...spec?.state, ...state } },
                status: "complete",
                usage,
              }
            : v
        )
      );
    }
  }, [isStreaming, raw, spec, state, usage]);

  useEffect(() => {
    if (mode !== Mode.DESIGN || selectedDesignToolId !== "component") {
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

  useEffect(() => {
    if (mode !== Mode.AI) {
      setIsHistoryOpen(false);
    }
  }, [mode]);

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
            <Island unstyled>
              <Toggle
                options={VIEWPORT_OPTIONS}
                value={viewportId}
                onChange={(value) => setViewportId(value)}
              />
            </Island>
          </Panel>
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
                      { id: Mode.AI, isAccent: true, label: "AI mode" },
                      { id: Mode.DESIGN, label: "Design mode" },
                    ]}
                    value={mode}
                    onChange={(value) => setMode(value)}
                    />
                </Island>
              </Item>
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
              {currentVersion ? (
                <Panel position="top-left">
                  <Island
                    maxHeight="calc(100vh - 327px)"
                    width={300}
                  >
                    <Styled.RailCardBody>
                      <Styled.RailHeader>
                        <Styled.RailTitle>{t("текущий запрос")}</Styled.RailTitle>
                        {currentVersion?.status === "pending" ? (
                          <Loader size="lg" />
                        ) : null}
                        <Styled.RailTag $tone="accent">
                          {currentVersionLabel}
                        </Styled.RailTag>
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
                {isToolDataVisible ? (
                  <Island width="100%">
                    <Flex vertical>
                      <Item>
                        <Tabs
                          items={[
                            { id: "api", label: "апи" },
                            { id: "structure", label: "структура" },
                            { id: "data", label: "данные" },
                          ]}
                          value={activeTabData}
                          onChange={(tab) => setActiveTabData(tab)}
                        />
                      </Item>
                      <Item grow>
                        {activeTabData === "api" ? apiEditor : null}
                      </Item>
                    </Flex>
                  </Island>
                ) : null}
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
          {mode === Mode.DESIGN && (
            <>
              {selectedDesignToolId === "component" ? (
                <Panel position="bottom-center">
                  <Island height={360} width="40vw">
                    <Styled.ComponentPickerSurface
                      data-component-picker-surface
                    >
                      <ToolBar items={toolBarItems} />
                    </Styled.ComponentPickerSurface>
                  </Island>
                </Panel>
              ) : null}
              <Panel
                position="top-left"
                style={{ height: "calc(100% - 212px)", marginTop: 76 }}
              >
                <Island width="min(300px, calc(50vw - 24px))" height="100%">
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
                          value={currentState as JsonValue}
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
                <Island width={300} height="calc(100vh - 119px)">
                  <Flex vertical>
                    <Item>
                      <Styled.Tabs>
                        <Tabs
                          items={[
                            { id: "properties", label: t("свойства") },
                            { id: "api", label: t("api") },
                          ]}
                          value={activeRightTab}
                          onChange={(id) => setActiveRightTab(id)}
                        />
                      </Styled.Tabs>
                    </Item>
                    <Item grow>
                      {/* eslint-disable-next-line no-nested-ternary */}
                      {activeRightTab === "properties" ? (
                        selectedElement ? (
                          <LevaPanel
                            name={selectedElement.id}
                            type={selectedElement.type}
                            controls={selectedElement.controls}
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
                      {activeRightTab === "api" ? apiEditor : null}
                    </Item>
                  </Flex>
                </Island>
              </Panel>
              <Panel position="bottom-center">
                <Island>
                  <div data-component-picker-trigger>
                    <ToolPicker
                      tools={DESIGN_TOOLS}
                      value={selectedDesignToolId}
                      onSelect={setSelectedDesignToolId}
                    />
                  </div>
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
      </Styled.Container>
    </DragDropProvider>
  );
};
