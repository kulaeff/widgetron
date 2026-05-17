import styled, { css } from "styled-components";

export const Toggle = styled.div(({ theme }) => css`
  background: ${theme.tokens.current.core.background.default};
  border: 1px solid ${theme.tokens.current.core.border.strong};
  border-radius: 8px;
  display: inline-flex;
  gap: 6px;
  padding: 3px;
`);

export const Option = styled.button<{
  $isAccent: boolean;
  $isActive: boolean;
}>(
  ({ $isAccent, $isActive, theme }) => css`
    ${theme.typography.body1Regular};
    appearance: none;
    border: none;
    border-radius: 5px;
    color: ${$isActive
      ? theme.tokens.current.core.text.onColor
      : theme.tokens.current.core.text.primary};
    cursor: pointer;
    padding: 6px 12px;
    transition: background-color 100ms, color 100ms, transform 100ms;
    white-space: nowrap;
    ${$isActive
      ? $isAccent
        ? css`
            background: linear-gradient(135deg, #d72662 0%, #5b5bd6 100%);
          `
        : css`
            background-color: ${theme.tokens.current.colors.blue.solid[60]};
          `
      : css`
          background-color: transparent;
          color: ${theme.tokens.current.core.text.secondary};
          &:hover {
            background-color: ${theme.tokens.current.core.layer["01"]};
            color: ${theme.tokens.current.core.text.primary};
          }
        `}
  `
);
