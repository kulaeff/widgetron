import type { Spec } from "@json-render/core";
import type { Viewport } from "../../types";

export interface PreviewProps extends Record<string, unknown> {
  constraints?: Pick<
    Viewport,
    "width" | "height" | "minWidth" | "minHeight"
  >;
  loading: boolean;
  selected?: boolean;
  selectedElementID?: string;
  spec: Spec | null;
  viewId?: string;
  onElementSelect?: (viewId: string, elementId: string) => void;
}

export interface Droppable {
  id: string;
  rect: Rect;
}

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}
