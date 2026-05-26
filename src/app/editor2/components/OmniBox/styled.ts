import styled, { css } from "styled-components";

export const Buttons = styled("div")`
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;
`;

export const LeftActions = styled("div")`
  align-items: center;
  display: flex;
  flex: 1;
  gap: 8px;
  min-width: 0;
`;

export const ContextTags = styled("div")`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
`;

export const ContextTag = styled("span")(
  ({ theme }) => css`
    ${theme.typography.captionRegular};
    align-items: center;
    background: ${theme.tokens.current.core.layer["01"]};
    border: 1px solid ${theme.tokens.current.core.border.strong};
    border-radius: 999px;
    color: ${theme.tokens.current.core.text.secondary};
    display: inline-flex;
    gap: 2px;
    padding: 2px 4px 2px 8px;
    white-space: nowrap;
  `
);

export const ContextTagButton = styled("button")(
  ({ theme }) => css`
    align-items: center;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    gap: 6px;
    padding: 0;

    &:hover {
      color: ${theme.tokens.current.core.text.primary};
    }
  `
);

export const ContextTagRemove = styled("button")(
  ({ theme }) => css`
    align-items: center;
    background: none;
    border: none;
    border-radius: 999px;
    color: ${theme.tokens.current.core.text.secondary};
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    height: 18px;
    justify-content: center;
    line-height: 1;
    padding: 0;
    width: 18px;

    &:hover {
      background: ${theme.tokens.current.interactive.hover.tertiary};
      color: ${theme.tokens.current.core.text.primary};
    }
  `
);

export const ContextTagBadge = styled("span")(
  ({ theme }) => css`
    ${theme.typography.captionRegular};
    align-items: center;
    background: rgba(42, 124, 240, 0.12);
    border-radius: 999px;
    color: ${theme.tokens.current.colors.blue.solid[60]};
    display: inline-flex;
    justify-content: center;
    min-width: 18px;
    padding: 0 5px;
  `
);

export const OmniBox = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const TextArea = styled("textarea")(({ theme }) => ({
  ...theme.typography.body1Regular,
  backgroundColor: "transparent",
  appearance: "none",
  border: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  maxHeight: "100px",
  outline: "none",
  padding: 0,
  resize: "none",
  width: "100%",
  "&:disabled": {
    backgroundColor: "transparent",
  },
}));
