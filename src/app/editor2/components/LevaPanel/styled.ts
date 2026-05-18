import styled, { css } from "styled-components";

export const Container = styled.div`
  height: 100%;
`;

export const Header = styled.div`
  align-items: center;
  display: grid;
  gap: 8px;
  grid-template-columns: auto 1fr;
`;

export const Name = styled.span(
  ({ theme }) => css`
    color: ${theme.tokens.current.core.text.secondary};
    display: block;
  `
);

export const Panel = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 16px;
`;

export const Row = styled.div<{ $bound: boolean }>(
  ({ theme }) => css`
    align-items: start;
    display: grid;
    gap: 8px;
    grid-template-columns: 96px minmax(0, 1fr) auto;
    position: relative;
  `
);

export const Label = styled.label(
  ({ theme }) => css`
    ${theme.typography.body2Regular};
    color: ${theme.tokens.current.core.text.secondary};
    line-height: 30px;
  `
);

const controlStyles = css`
  border-radius: 6px;
  min-height: 30px;
  width: 100%;
`;

export const Input = styled.input(
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
    min-height: 88px;
    padding: 8px;
    resize: vertical;
  `
);

export const Select = styled.select(
  ({ theme }) => css`
    ${controlStyles};
    background: ${theme.tokens.current.core.layer["01"]};
    border: 1px solid ${theme.tokens.current.core.border.strong};
    color: ${theme.tokens.current.core.text.primary};
    padding: 4px 8px;
  `
);

export const Checkbox = styled.input`
  align-self: center;
  height: 16px;
  margin: 8px 0 0;
  width: 16px;
`;

export const BindingColumn = styled.div`
  align-items: end;
  display: grid;
  gap: 4px;
  justify-items: end;
`;

export const FxButton = styled.button<{ $active: boolean }>(
  ({ $active, theme }) => css`
    ${theme.typography.body2Semibold};
    background: ${$active
      ? theme.tokens.current.system["30"]
      : theme.tokens.current.core.layer["01"]};
    border: 1px solid
      ${$active
        ? theme.tokens.current.system["30"]
        : theme.tokens.current.core.border.strong};
    border-radius: 6px;
    color: ${$active
      ? theme.tokens.current.core.background.default
      : theme.tokens.current.core.text.primary};
    cursor: pointer;
    height: 30px;
    min-width: 38px;
    padding: 0 8px;
  `
);

export const BindingBadge = styled.span(
  ({ theme }) => css`
    ${theme.typography.captionRegular};
    color: ${theme.tokens.current.system["30"]};
  `
);

export const BindingExpression = styled.span(
  ({ theme }) => css`
    ${theme.typography.captionRegular};
    color: ${theme.tokens.current.core.text.secondary};
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `
);

export const Popover = styled.div(
  ({ theme }) => css`
    background: ${theme.tokens.current.core.background.default};
    border: 1px solid ${theme.tokens.current.core.border.strong};
    border-radius: 8px;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
    display: grid;
    gap: 8px;
    grid-column: 1 / -1;
    margin-top: 4px;
    padding: 10px;
  `
);

export const Field = styled.div`
  display: grid;
  gap: 4px;
`;

export const FieldLabel = styled.span(
  ({ theme }) => css`
    ${theme.typography.captionRegular};
    color: ${theme.tokens.current.core.text.secondary};
  `
);

export const ErrorText = styled.span(
  ({ theme }) => css`
    ${theme.typography.captionRegular};
    color: ${theme.tokens.current.system["30"]};
  `
);

export const PopoverActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: end;
`;

export const SecondaryButton = styled.button(
  ({ theme }) => css`
    ${theme.typography.body2Regular};
    background: ${theme.tokens.current.core.layer["01"]};
    border: 1px solid ${theme.tokens.current.core.border.strong};
    border-radius: 6px;
    color: ${theme.tokens.current.core.text.primary};
    cursor: pointer;
    min-height: 30px;
    padding: 0 10px;
  `
);

export const PrimaryButton = styled.button(
  ({ theme }) => css`
    ${theme.typography.body2Semibold};
    background: ${theme.tokens.current.system["30"]};
    border: 1px solid ${theme.tokens.current.system["30"]};
    border-radius: 6px;
    color: ${theme.tokens.current.core.background.default};
    cursor: pointer;
    min-height: 30px;
    padding: 0 10px;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  `
);
