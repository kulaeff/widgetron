import styled from "styled-components";
import type { RequiredProperty, Wrap } from "../types";
import type { StackProps } from "./types";

export const Stack = styled.div<
  Wrap<
    RequiredProperty<Omit<StackProps, "children">, "align" | "gap" | "justify">
  >
>`
  align-items: ${({ $align }) => $align};
  display: flex;
  flex-direction: ${({ $direction }) => $direction};
  gap: ${({ $gap }) => $gap * 4}px;
  height: 100%;
  justify-content: ${({ $justify }) => $justify};
  width: 100%;
`;
