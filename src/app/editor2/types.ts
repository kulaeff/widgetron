import type { Spec } from "@json-render/core";

export interface Viewport {
  id: string;
  label: string;
  description: string;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
}

export interface DraggingCatalogComponentPayload {
  height: number;
  name: string;
  width: number;
}

export interface Version {
  id: string;
  prompt: string;
  raw: string[];
  spec: Spec;
  status: "pending" | "complete" | "error";
  usage: {
    prompt: number;
    completion: number;
    total: number;
  } | null;
}
