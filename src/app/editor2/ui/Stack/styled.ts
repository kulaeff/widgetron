import styled, { css } from "styled-components";
import type { RequiredProperty, Wrap } from "../types";
import type { StackProps } from "./types";

export const Stack = styled.div<
  Wrap<
    RequiredProperty<Omit<StackProps, "children">, "align" | "gap" | "height" |"justify">
  >
>(
  ({ $align, $direction, $gap, $height, $justify }) => css`
    align-items: ${$align};
    display: flex;
    flex-direction: ${$direction};
    gap: ${$gap * 4}px;
    height: ${$height};
    justify-content: ${$justify};
  `
);
