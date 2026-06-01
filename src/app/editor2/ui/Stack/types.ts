import type { CSSProperties, HTMLAttributes } from "react";

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Выравнивание по основной оси
   */
  align?: Extract<
    CSSProperties["alignItems"],
    "start" | "center" | "end" | "stretch"
  >;
  /**
   * Направление
   */
  direction?: "row" | "column";
  /**
   * Отступы
   */
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  /**
   * Высота
   */
  height?: "auto" | "stretch";
  /**
   * Выравнивание по вспомогательной оси
   */
  justify?: Extract<
    CSSProperties["justifyContent"],
    "start" | "center" | "end" | "stretch" | "space-around" | "space-between"
  >;
}
