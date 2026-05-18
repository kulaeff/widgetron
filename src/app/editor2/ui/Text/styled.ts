import styled, { css } from "styled-components";
import type { Wrap } from "../types";
import type { TextProps } from "./types";

export const Text = styled.p<Wrap<Required<Pick<TextProps, "variant">>>>`
  ${({ $variant, theme }) =>
    css`
      ${theme.typography[$variant]}
    `}
  display: block;
  margin: 0;
`;
