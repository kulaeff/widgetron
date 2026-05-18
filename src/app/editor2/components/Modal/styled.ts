import styled, { css } from "styled-components";

export const Dialog = styled.dialog(({ theme }) => css`
  ${theme.typography.body2Regular};
  background: ${theme.tokens.current.core.background.default};
  border: 1px solid ${theme.tokens.current.core.border.strong};
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  color: ${theme.tokens.current.core.text.primary};
  max-height: min(80vh, 720px);
  max-width: min(90vw, 720px);
  min-width: 320px;
  overflow: auto;
  padding: 16px;
  &::backdrop {
    background: rgba(0, 0, 0, 0.45);
  }
`);
