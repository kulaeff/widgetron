import styled, { css } from "styled-components";

export const Container = styled.div`
  display: grid;
  gap: 12px;
  height: 100%;
`;

export const Row = styled.div`
  display: grid;
  gap: 6px;
`;

export const Label = styled.span(
  ({ theme }) => css`
    ${theme.typography.body2Regular};
    color: ${theme.tokens.current.core.text.secondary};
  `
);

const controlStyles = css`
  border-radius: 6px;
  min-height: 32px;
  width: 100%;
`;

export const Select = styled.select(
  ({ theme }) => css`
    ${controlStyles};
    background: ${theme.tokens.current.core.layer["01"]};
    border: 1px solid ${theme.tokens.current.core.border.strong};
    color: ${theme.tokens.current.core.text.primary};
    padding: 4px 8px;
  `
);

export const TextArea = styled.textarea(
  ({ theme }) => css`
    ${theme.typography.body2Regular};
    ${controlStyles};
    background: ${theme.tokens.current.core.layer["01"]};
    border: 1px solid ${theme.tokens.current.core.border.strong};
    color: ${theme.tokens.current.core.text.primary};
    min-height: 180px;
    padding: 8px;
    resize: vertical;
  `
);

export const Hints = styled.ul(
  ({ theme }) => css`
    ${theme.typography.captionRegular};
    color: ${theme.tokens.current.core.text.secondary};
    margin: 0;
    padding-left: 18px;
  `
);

export const Hint = styled.li`
  margin: 0;
`;

export const ErrorText = styled.span(
  ({ theme }) => css`
    ${theme.typography.captionRegular};
    color: ${theme.tokens.current.system["30"]};
  `
);

export const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

export const Button = styled.button<{ $primary?: boolean }>(
  ({ $primary = false, theme }) => css`
    ${theme.typography.body2Regular};
    background: ${$primary
      ? theme.tokens.current.system["30"]
      : theme.tokens.current.core.layer["01"]};
    border: 1px solid
      ${$primary
        ? theme.tokens.current.system["30"]
        : theme.tokens.current.core.border.strong};
    border-radius: 6px;
    color: ${$primary
      ? theme.tokens.current.core.background.default
      : theme.tokens.current.core.text.primary};
    cursor: pointer;
    min-height: 32px;
    padding: 0 10px;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  `
);
