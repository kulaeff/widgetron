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
  onElementSelect?: (id: string) => void;
}

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}
