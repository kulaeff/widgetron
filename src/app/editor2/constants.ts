import type { Viewport } from "./types";

export const CONTENT_TYPE = {
  PAGE: "page",
  TILE: "tile",
} as const;

export const PAGE_SIZE = {
  minWidth: 512,
  minHeight: 512,
  maxWidth: 1024,
} as const;

export const TILE_SIZE: Viewport[] = [
  { id: "minor", label: "SM", description: "Малая плитка", width: 294, height: 280 },
  { id: "important", label: "MD", description: "Средняя плитка", width: 612, height: 280 },
  { id: "major", label: "LG", description: "Большая плитка", width: 612, height: 612 },
] as const;

export const MODE = {
  AI: "ai",
  DEV: "dev",
  RUN: "run",
} as const;
