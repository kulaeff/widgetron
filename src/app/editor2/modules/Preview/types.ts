import type { Spec } from "@json-render/core";

export interface PreviewProps extends Record<string, unknown> {
  loading: boolean;
  selected?: boolean;
  selectedElementID?: string;
  spec: Spec | null;
  viewportSize?: {
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
  };
  onElementSelect?: (id: string) => void;
}

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}
