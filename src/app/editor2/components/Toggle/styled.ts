import styled, { css } from "styled-components";

export const Toggle = styled("div")`
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #d1d5db;
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.1);
  display: inline-flex;
  gap: 6px;
  padding: 5px;
`;

export const Option = styled("button")<{
  $isAccent: boolean;
  $isActive: boolean;
}>(
  ({ $isAccent, $isActive, theme }) => css`
    ${theme.typography.body1Semibold};
    appearance: none;
    border: none;
    border-radius: 14px;
    color: ${$isActive
      ? theme.tokens.current.core.text.onColor
      : theme.tokens.current.core.text.primary};
    cursor: pointer;
    min-height: 32px;
    padding: 0 18px;
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
