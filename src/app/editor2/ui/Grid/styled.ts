import styled from "styled-components";
import type { RequiredProperty, Wrap } from "../types";
import type { GridProps } from "./types";

/**
 * Конвертирует конфигурацию колонок в CSS правило.
 *
 * @example
 * buildGridTemplateColumnsRule("* 2* auto") // "1fr 2fr auto"
 *
 * @param columns - Конфигурация колонок
 */
const buildGridTemplateColumnsRule = (columns?: string) => {
  if (columns === undefined) {
    return undefined;
  }

  const tokens = columns.split(" ");

  return tokens
    .map((token) => {
      if (token === "auto") {
        return "auto";
      }

      const match = token.match(/(\d)?\*/);

      if (match) {
        return `${match[1] ?? 1}fr`;
      }

      return undefined;
    })
    .filter(Boolean)
    .join(" ");
};

export const Grid = styled.div<
  Wrap<
    RequiredProperty<Omit<GridProps, "children">, "align" | "gap" | "justify">
  >
>`
  align-items: ${({ $align }) => $align};
  display: grid;
  grid-template-columns: ${({ $columns }) =>
    buildGridTemplateColumnsRule($columns)};
  gap: ${({ $gap }) => $gap * 4}px;
  height: 100%;
  justify-content: ${({ $justify }) => $justify};
`;
