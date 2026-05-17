import styled, { css } from "styled-components";

export const Divider = styled("hr")(({ theme }) => css`
  border: none;
  border-top: 1px solid ${theme.tokens.current.core.border.strong};
  margin: 0;
`);
