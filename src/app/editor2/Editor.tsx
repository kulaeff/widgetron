import * as Styled from "./styled";
import { validateSpec } from "@json-render/core";
import type { Spec } from "@json-render/react";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { JsonEditor, JsonValue } from "@visual-json/react";
import { Control, FormField, Label } from "@pulse/ui/components/FormField";
import { Input } from "@pulse/ui/components/Input";
import { Tabs } from "./components/Tabs";
import { TextArea } from "@pulse/ui/components/Input/TextArea";
import { CSSProperties, type FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";
import { Island } from "./components/Island";
import { Preview, type PreviewProps } from "./components/Preview";
import { useUIStream } from "./hooks/useUIStream";
import { OmniBox } from "./components/OmniBox";
import { ToolBar } from "./components/ToolBar";
import { ToolPicker, type ToolPickerItem } from "./components/ToolPicker";
import { ZoomControl, type ZoomOption } from "./components/ZoomControl";
import { TREE_ROOT_DROP_TARGET_ID, TreeView } from "./components/TreeView";
import { catalog } from "./lib/catalog";
import { buildCatalogData, type CatalogComponentInfo } from "./utils/catalog-data";
import { type LevaControl, LevaPanel } from "./components/LevaPanel";
import { Section, Sections } from "./components/Sections";
import { Versions } from "./components/Versions";
import { CodeBlock } from "./components/CodeBlock";
import { Version } from "./types";
import { Button } from "@pulse/ui/components/Button";
import { Option, Select } from "@pulse/ui/components/Select";
import type { WidgetCreatorProps, WidgetCreatorSavePayload } from "../../widgets/WidgetCreator/types";
import {
  DragDropProvider,
  DragOverlay,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/react";
import {
  Background,
  type Node,
  type NodeOrigin,
  type NodeProps,
  Panel,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import {
  addCatalogComponentToVersions,
  buildSpecTreeItems,
  moveElementInSpec,
} from "./spec-utils";
import { Toggle } from "./components/Toggle";

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
  { id: "sm", label: "SM", width: 294, height: 280 },
  { id: "md", label: "MD", width: 612, height: 280 },
  { id: "lg", label: "LG", width: 612, height: 612 },
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
  const [activeRightTab, setActiveRightTab] = useState("properties");
  const [mode, setMode] = useState<string>(Mode.AI);
  const [selectedElementId, setSelectedElementId] = useState<string>();
  const [selectedVersionId, setSelectedVersionId] = useState<string>();
  const [state, setState] = useState<Record<string, unknown>>({});
  const [type, setType] = useState("");
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [versions, setVersions] = useState<Version[]>([]);
  const [activeDropTargetId, setActiveDropTargetId] = useState<string | null>(null);
  const [activeTreeDropTargetId, setActiveTreeDropTargetId] = useState<string | null>(null);
  const [draggedCatalogComponentName, setDraggedCatalogComponentName] = useState<string | null>(null);
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
  const currentVersionLabel = currentVersionNumber ? `v${currentVersionNumber}` : "без версии";
  const currentPromptLabel = currentVersion?.prompt?.trim() ?? "";
  const hasCurrentPrompt = currentPromptLabel.length > 0;
  const currentStatusLabel = isStreaming || currentVersion?.status === "pending"
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

  const currentNodes = [
    {
      id: 'n1',
      position: { x: 0, y: 0 },
      data: {
        activeDropTargetId: draggedCatalogComponentName ? activeDropTargetId : null,
        emptyLabel: mode === Mode.AI ? "Ожидание генерации интерфейса..." : "Перетащите сюда компонент из палитры",
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

  console.log("CURRENT VERSION", currentVersion);
  console.log("CURRENT SPEC", currentSpec);
  console.log("CURRENT STATE", currentSpec?.state, state);

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

  const handleButtonFetchDataSourceClick = async () => {
    const response = await fetch(url, {
      method,
    });

    const data = await response.json();

    setState((p) => ({
      ...p,
      data,
    }));
  };

  const handleSave = useCallback(async () => {
    const scheme = currentVersion?.spec ?? spec ?? null;

    if (!scheme || !onSave) {
      return;
    }

    const payload: WidgetCreatorSavePayload = {
      data: currentSnapshotData,
      dataSource: {
        method,
        type,
        url,
      },
      scheme,
    };

    await onSave(payload);
  }, [currentSnapshotData, currentVersion?.spec, method, onSave, spec, type, url]);

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

      let data: Record<string, unknown> | null = null;

      if (url) {
        const response = await fetch(url, {
          method,
        });

        data = await response.json();
      }

      await send(value, {
        data,
        previousSpec: currentVersion?.spec,
      });
    },
    [currentVersion, send]
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
    target: DragMoveEvent["operation"]["target"] | DragEndEvent["operation"]["target"]
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

    const treeDropTarget = resolveTreeDropTargetFromNativeEvent(event.nativeEvent);

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
        const treeDropTarget = resolveTreeDropTargetFromNativeEvent(event.nativeEvent);

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

  return (
    <DragDropProvider
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <DragOverlay>
        {draggedCatalogComponentName ? (
          <Styled.DragOverlayItem>{draggedCatalogComponentName}</Styled.DragOverlayItem>
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
          <Panel position="top-left">
            <Styled.ViewportDock>
              <Toggle
                options={VIEWPORT_OPTIONS}
                value={viewportId}
                onChange={(value) => setViewportId(value)}
              />
            </Styled.ViewportDock>
          </Panel>
          <Panel position="top-right">
            <div>
              <Styled.SaveDock>
                <Styled.SaveButton
                  type="button"
                  disabled={!currentSpec}
                  onClick={() => void handleSave()}
                >
                  {t("сохранить")}
                </Styled.SaveButton>
              </Styled.SaveDock>
            </div>
          </Panel>
          <Panel position="top-right">
            <div>
              <Styled.ModeDock>
                <Toggle
                  options={[
                    { id: Mode.AI, isAccent: true, label: "AI mode" },
                    { id: Mode.DESIGN, label: "Design mode" }
                  ]}
                  value={mode}
                  onChange={(value) => setMode(value)}
                />
              </Styled.ModeDock>
            </div>
          </Panel>
          <Panel position="bottom-right">
            <Island>
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
              <Panel
                position="top-left"
                style={{ height: "calc(100% - 108px)", marginTop: 76 }}
              >
                <Styled.AIRail>
                  {hasCurrentPrompt ? (
                    <Styled.RailCard>
                      <Styled.RailCardBody>
                        <Styled.RailHeader>
                          <Styled.RailTitle>{t("текущий запрос")}</Styled.RailTitle>
                          <Styled.RailTag $tone="accent">
                            {currentVersionLabel}
                          </Styled.RailTag>
                        </Styled.RailHeader>
                        <Styled.RailMeta>
                          <Styled.RailTag
                            $tone={isStreaming || currentVersion?.status === "pending" ? "accent" : "default"}
                          >
                            {currentStatusLabel}
                          </Styled.RailTag>
                          {hasApiData ? (
                            <Styled.RailTag $tone="success">
                              API data
                            </Styled.RailTag>
                          ) : null}
                        </Styled.RailMeta>
                        <Styled.PromptPreview>
                          {currentPromptLabel}
                        </Styled.PromptPreview>
                      </Styled.RailCardBody>
                    </Styled.RailCard>
                  ) : null}
                  <Styled.HistoryDock>
                    <Styled.HistoryCard $withAccent={false}>
                      <Styled.HistoryCardBody>
                        <Styled.HistoryTrigger
                          type="button"
                          disabled={versions.length === 0}
                          onClick={() => setIsHistoryOpen((value) => !value)}
                        >
                          <Styled.HistoryTriggerMain>
                            <Styled.HistoryHeading>{t("История")}</Styled.HistoryHeading>
                            <Styled.HistoryTriggerValue>
                              {historyPreviewLabel}
                            </Styled.HistoryTriggerValue>
                          </Styled.HistoryTriggerMain>
                          <Styled.HistoryArrow $open={isHistoryOpen} aria-hidden="true">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                            >
                              <path
                                d="M4 6l4 4 4-4"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </Styled.HistoryArrow>
                        </Styled.HistoryTrigger>
                        {isHistoryOpen ? (
                          <Styled.HistoryList>
                            <Versions
                              disabled={isStreaming}
                              items={versions}
                              value={selectedVersionId}
                              onChange={handleVersionSelect}
                            />
                          </Styled.HistoryList>
                        ) : null}
                      </Styled.HistoryCardBody>
                    </Styled.HistoryCard>
                  </Styled.HistoryDock>
                </Styled.AIRail>
              </Panel>
              <Panel
                position="bottom-center"
                style={{ width: "min(760px, calc(100% - 440px))" }}
              >
                <Styled.BottomComposer>
                  <Island width="100%">
                    <Styled.ComposerShell>
                      <OmniBox
                        loading={isStreaming}
                        placeholder="Что вы хотите изменить или создать?"
                        onSubmit={handleOmniBoxSubmit}
                        onReset={clear}
                      />
                    </Styled.ComposerShell>
                  </Island>
                </Styled.BottomComposer>
              </Panel>
            </>
          )}
          {mode === Mode.DESIGN && (
            <>
              {selectedDesignToolId === "component" ? (
                <Panel position="bottom-center">
                  <Island
                    width="min(720px, calc(100% - 32px))"
                    height={360}
                    style={{ overflow: "hidden", zIndex: 20 }}
                  >
                    <Styled.ComponentPickerSurface data-component-picker-surface>
                      <ToolBar items={toolBarItems} />
                    </Styled.ComponentPickerSurface>
                  </Island>
                </Panel>
              ) : null}
              <Panel position="center-left">
                <Island width={300} height="calc(100% - 30px)">
                  <Sections vertical>
                    <Section size="auto">
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
                    </Section>
                    <Section>
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
                              "--vj-bg-panel": tokens.current.core.background.default,
                              "--vj-bg-hover": tokens.current.interactive.hover.tertiary,
                              "--vj-bg-selected": tokens.current.system["30"],
                              "--vj-bg-selected-muted": tokens.current.system["20"],
                              "--vj-border": tokens.current.core.border.strong,
                              "--vj-input-font-size": typography.body1Regular.fontSize,
                              "--vj-text": tokens.current.core.text.primary,
                              "--vj-text-muted": tokens.current.core.text.secondary,
                              "--vj-text-selected": tokens.current.core.text.onColor,
                              "--vj-boolean": tokens.current.colors.green.solid["60"],
                              "--vj-number": tokens.current.colors.blue.solid["60"],
                              "--vj-string": tokens.current.colors.orange.solid["60"],
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
                    </Section>
                  </Sections>
                </Island>
              </Panel>
              <Panel position="center-right">
                <Island width={300} height="calc(100% - 136px)">
                  <Sections vertical>
                    <Section size="auto">
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
                    </Section>
                    <Section>
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
                            {t("Выберите узел дерева для редактирования его свойств")}
                          </Styled.Placeholder>
                        )
                      ) : null}
                      {activeRightTab === "api" && (
                        <>
                          <FormField>
                            <Label>
                              <label htmlFor="url">url</label>
                            </Label>
                            <Control>
                              <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} />
                            </Control>
                          </FormField>
                          <FormField>
                            <Label>
                              <label htmlFor="method">method</label>
                            </Label>
                            <Control>
                              <Select
                                id="method"
                                value={method}
                                onChange={(value) => setMethod(value)}
                              >
                                <Option value="GET">GET</Option>
                                <Option value="POST">POST</Option>
                              </Select>
                            </Control>
                          </FormField>
                          <FormField>
                            <Label>
                              <label htmlFor="type">type</label>
                            </Label>
                            <Control>
                              <TextArea id="type" rows={5} value={type} onChange={(e) => setType(e.target.value)} />
                            </Control>
                          </FormField>
                          <Button onClick={handleButtonFetchDataSourceClick}>{t("получить")}</Button>
                        </>
                      )}
                    </Section>
                  </Sections>
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
