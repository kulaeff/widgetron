import type { Viewport } from "./types";

export const TILE_SIZE: Viewport[] = [
  { id: "minor", label: "SM", description: "Малая плитка", width: 294, height: 280 },
  { id: "important", label: "MD", description: "Средняя плитка", width: 612, height: 280 },
  { id: "major", label: "LG", description: "Большая плитка", width: 612, height: 612 },
  { id: "auto", label: "AUTO", description: "Свободные размеры", minWidth: 400, minHeight: 400 },
];

export const MODE = {
  AI: "ai",
  DEV: "dev",
  RUN: "run",
} as const;
