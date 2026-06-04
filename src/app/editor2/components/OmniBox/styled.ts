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
    align-items: center;
    background: ${theme.tokens.current.core.layer["01"]};
    border: 1px solid ${theme.tokens.current.core.border.strong};
    border-radius: 4px;
    color: ${theme.tokens.current.core.text.secondary};
    display: inline-flex;
    gap: 8px;
    padding: 2px 2px 2px 8px;
    white-space: nowrap;
  `
);

export const ContextTagButton = styled("button")(
  ({ theme }) => css`
    ${theme.typography.captionRegular};
    appearance: none;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    outline: none;
    padding: 0;
    &:hover {
      color: ${theme.tokens.current.core.text.primary};
    }
  `
);

export const ContextTagRemove = styled("button")(
  ({ theme }) => css`
    background: none;
    border: none;
    border-radius: 2px;
    color: ${theme.tokens.current.core.text.secondary};
    cursor: pointer;
    height: 26px;
    justify-content: center;
    line-height: 1;
    padding: 0;
    width: 26px;
    &:hover {
      background: ${theme.tokens.current.interactive.hover.secondary};
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

export const ElementTag = styled("span")(
  ({ theme }) => css`
    ${theme.typography.captionRegular};
    align-items: center;
    align-self: start;
    background: ${theme.tokens.current.core.layer["01"]};
    border: 1px solid ${theme.tokens.current.core.border.strong};
    border-radius: 4px;
    color: ${theme.tokens.current.core.text.secondary};
    cursor: pointer;
    display: block;
    padding: 6px 8px;
    transition: color 75ms;
    white-space: nowrap;
    &:hover {
      color: ${theme.tokens.current.core.text.primary};
    }
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
