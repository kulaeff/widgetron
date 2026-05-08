import { validateSpec } from "@json-render/core";
import type { Spec } from "@json-render/react";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { JsonEditor, JsonValue } from "@visual-json/react";
import { Control, FormField, Label } from "@pulse/ui/components/FormField";
import { Input } from "@pulse/ui/components/Input";
import { Tab, Tabs } from "@pulse/ui/components/Tabs";
import { TextArea } from "@pulse/ui/components/Input/TextArea";
import { SizeSelector, type SizeSelectorOption } from "@pulse/ui/components/SizeSelector";
import { Switch } from "@pulse/ui/components/Switch";
import { CSSProperties, type FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";
import * as Styled from "./styled";
import { Island } from "../../components/Island";
import { Preview } from "../../components/Preview";
import { useUIStream } from "../../hooks/useUIStream";
import { OmniBox } from "../../components/OmniBox";
import { ToolBar } from "../../components/ToolBar";
import { ToolPicker, type ToolPickerItem } from "../../components/ToolPicker";
import { ZoomControl, type ZoomOption } from "../../components/ZoomControl";
import { TREE_ROOT_DROP_TARGET_ID, TreeView } from "../../components/TreeView";
import { catalog } from "../../lib/catalog";
import { buildCatalogData, type CatalogComponentInfo } from "../../utils/catalog-data";
import { type LevaControl, LevaPanel } from "../../components/LevaPanel";
import { Section, Sections } from "../../components/Sections";
import { Versions } from "../../components/Versions";
import { CodeBlock } from "../../components/CodeBlock";
import { Version } from "./types";
import { Button } from "@pulse/ui/components/Button";
import { Option, Select } from "@pulse/ui/components/Select";
import {
  DragDropProvider,
  DragOverlay,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/react";
import {
  addCatalogComponentToVersions,
  buildSpecTreeItems,
  moveElementInSpec,
} from "./spec-utils";

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

const VIEWPORT_OPTIONS: Array<
  SizeSelectorOption & { width: number; height: number }
> = [
  { id: "sm", label: "SM", width: 290, height: 290 },
  { id: "md", label: "MD", width: 512, height: 512 },
  { id: "lg", label: "LG", width: 800, height: 800 },
];

const ZOOM_OPTIONS: ZoomOption[] = [
  { id: "50", label: "50%", value: 0.5 },
  { id: "75", label: "75%", value: 0.75 },
  { id: "100", label: "100%", value: 1 },
  { id: "125", label: "125%", value: 1.25 },
  { id: "150", label: "150%", value: 1.5 },
];

const DESIGN_TOOLS: ToolPickerItem[] = [
  { id: "select", title: "Select" },
  { id: "component", title: "Component" },
];

export const Home: FC = () => {
  const { t } = useTranslation();
  const { tokens, typography } = useTheme();

  const [activeTab, setActiveTab] = useState(0);
  const [activeRightTab, setActiveRightTab] = useState(0);
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
  const [isDesignMode, setIsDesignMode] = useState(false);
  const [selectedDesignToolId, setSelectedDesignToolId] = useState("select");
  const [viewportId, setViewportId] = useState(VIEWPORT_OPTIONS[1]!.id);
  const [zoom, setZoom] = useState(1);

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
      VIEWPORT_OPTIONS[1]!,
    [viewportId]
  );

  const currentSpec = currentVersion?.spec ?? spec;
  const currentState = {
    ...(currentVersion?.spec?.state ?? spec?.state),
    ...state,
  };

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

      console.log(targetElementId, componentName, components);

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

  const resolveDropTargetFromNativeEvent = (event?: Event): string | null => {
    if (!(event instanceof MouseEvent || event instanceof PointerEvent)) {
      return null;
    }

    const hoveredElement = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-element-id]");

    if (!hoveredElement) {
      return null;
    }

    return hoveredElement.getAttribute("data-element-id");
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

    if (event.operation.target?.id !== "preview") {
      setActiveDropTargetId(null);
      setActiveTreeDropTargetId(null);
      return;
    }

    setActiveTreeDropTargetId(null);
    setActiveDropTargetId(resolveDropTargetFromNativeEvent(event.nativeEvent) ?? "preview");
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
        } else if (event.operation.target?.id === "preview") {
          const resolvedTargetId =
            resolveDropTargetFromNativeEvent(event.nativeEvent) ?? "preview";

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
      console.log("SET STATE");
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
    if (!isDesignMode || selectedDesignToolId !== "component") {
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
  }, [isDesignMode, selectedDesignToolId]);

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
        <Styled.Workspace>
          <Styled.Preview>
            <Preview
              loading={isStreaming}
              spec={currentSpec}
              state={currentState}
              viewportSize={{
                width: selectedViewport.width,
                height: selectedViewport.height,
              }}
              zoom={zoom}
              activeDropTargetId={draggedCatalogComponentName ? activeDropTargetId : null}
              emptyLabel={isDesignMode ? null : undefined}
              setState={setState}
              selectedElementId={selectedElementId}
              // onStateChange={handlePreviewStateChange}
            />
          </Styled.Preview>
          <Island position={["left", "top"]}>
            <SizeSelector
              options={VIEWPORT_OPTIONS}
              value={viewportId}
              onChange={(value) => setViewportId(value)}
            />
          </Island>
          <Island position={["right", "top"]}>
            <Styled.ModeSwitch>
              <Styled.ModeLabel $active={!isDesignMode}>AI mode</Styled.ModeLabel>
              <Switch
                checked={isDesignMode}
                onChange={(event) => setIsDesignMode(event.target.checked)}
              />
              <Styled.ModeLabel $active={isDesignMode}>Design mode</Styled.ModeLabel>
            </Styled.ModeSwitch>
          </Island>
          <Island position={["right", "bottom"]}>
            <ZoomControl
              value={zoom}
              options={ZOOM_OPTIONS}
              onChange={(value) => setZoom(value)}
            />
          </Island>

          {!isDesignMode && (
            <>
              <Island
                title={t("версии")}
                position="left"
                width={360}
                height={420}
              >
                <Versions
                  disabled={isStreaming}
                  items={versions}
                  value={selectedVersionId}
                  onChange={(id) => {
                    setSelectedVersionId(id);
                    setSelectedElementId(undefined);
                  }}
                />
              </Island>

              <Island position="bottom" offset={24} width="min(620px, calc(100vw - 32px))">
                <OmniBox
                  loading={isStreaming}
                  onSubmit={handleOmniBoxSubmit}
                  onReset={clear}
                />
              </Island>
            </>
          )}

          {isDesignMode && (
            <>
              {selectedDesignToolId === "component" ? (
                <Island
                  position="bottom"
                  offset={[16, 88]}
                  style={{ overflow: "hidden", zIndex: 20 }}
                  width="min(360px, calc(100vw - 32px))"
                  height="50%"
                >
                  <Styled.ComponentPickerSurface data-component-picker-surface>
                    <ToolBar items={toolBarItems} />
                  </Styled.ComponentPickerSurface>
                </Island>
              ) : null}

              <Island
                position="left"
                width="min(360px, calc((100vw - 56px) / 2))"
                height="75%"
              >
                <Sections vertical>
                  <Section size="auto">
                    <Styled.Tabs>
                      <Tabs
                        $type="tertiary"
                        selectedIndex={activeTab}
                        onTabChange={(_, id) => setActiveTab(id)}
                      >
                        <Tab>{t("элементы")}</Tab>
                        <Tab>{t("стейт")}</Tab>
                        <Tab>{t("поток")}</Tab>
                        <Tab>{t("код")}</Tab>
                      </Tabs>
                    </Styled.Tabs>
                  </Section>
                  <Section>
                    {activeTab === 0 ? (
                      <TreeView
                        activeCatalogDropTargetId={activeTreeDropTargetId}
                        items={treeViewElementsItems}
                        value={selectedElementId}
                        onChange={handleTreeViewElementsChange}
                        onItemPositionChange={handleTreeViewMove}
                      />
                    ) : null}
                    {activeTab === 1 ? (
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
                    {activeTab === 2 ? (
                      <CodeBlock
                        code={currentVersion?.raw.join("\n") ?? ""}
                        fillHeight
                        lang="json"
                      />
                    ) : null}
                    {activeTab === 3 ? (
                      <MonacoEditor
                        language="json"
                        options={{
                          readOnly: isStreaming,
                        }}
                        value={JSON.stringify(currentVersion?.spec, null, 2)}
                        onChange={handleMonacoEditorChange}
                      />
                    ) : null}
                  </Section>
                </Sections>
              </Island>

              <Island
                position="right"
                width="min(320px, calc((100vw - 56px) / 2))"
                height="calc(100% - 144px)"
              >
                <Sections vertical>
                  <Section size="auto">
                    <Styled.Tabs>
                      <Tabs
                        $type="tertiary"
                        selectedIndex={activeRightTab}
                        onTabChange={(_, id) => setActiveRightTab(id)}
                      >
                        <Tab>{t("свойства")}</Tab>
                        <Tab>{t("api")}</Tab>
                      </Tabs>
                    </Styled.Tabs>
                  </Section>
                  <Section>
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {activeRightTab === 0 ? (
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
                    {activeRightTab === 1 && (
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
              <Island position="bottom">
                <div data-component-picker-trigger>
                  <ToolPicker
                    tools={DESIGN_TOOLS}
                    defaultSelectedId={selectedDesignToolId}
                    onSelect={setSelectedDesignToolId}
                  />
                </div>
              </Island>
            </>
          )}
        </Styled.Workspace>
      </Styled.Container>
    </DragDropProvider>
  );
};
