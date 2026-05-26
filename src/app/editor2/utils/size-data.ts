export interface ContentAreaSizeInfo {
  id: string;
  label: string;
  description: string;
  width: number;
  height: number;
}

export const CONTENT_AREA_SIZES = [
  { id: "minor", label: "SM", description: "Малая плитка", width: 294, height: 280 },
  { id: "important", label: "MD", description: "Средняя плитка", width: 612, height: 280 },
  { id: "major", label: "LG", description: "Большая плитка", width: 612, height: 612 },
] as const satisfies readonly ContentAreaSizeInfo[];

export type ContentAreaSize = (typeof CONTENT_AREA_SIZES)[number];
export type SizeId = ContentAreaSize["id"];

export const DEFAULT_SIZE_ID: SizeId = CONTENT_AREA_SIZES[0].id;

export const getSizeOption = (id: string): ContentAreaSize =>
  CONTENT_AREA_SIZES.find((option) => option.id === id) ?? CONTENT_AREA_SIZES[0];
