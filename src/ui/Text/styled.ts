import styled, { css } from "styled-components";
import type { Wrap } from "../types";
import type { TextProps } from "./types";

export const Text = styled.div<Wrap<Required<Omit<TextProps, "text">>>>`
  ${({ $variant, theme }) =>
    css`
      ${theme.typography[$variant]}
    `}
  display: block;
`;
