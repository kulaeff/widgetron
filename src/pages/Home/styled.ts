import styled, { css } from "styled-components";

export const Container = styled("div")({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  overflow: "hidden",
  fontFamily: '"SB Sans Text", Helvetica, Arial, sans-serif',
});

export const Placeholder = styled.div(
  ({ theme }) => css`
    ${theme.typography.body2Regular}
    align-content: center;
    color: ${theme.tokens.current.core.text.secondary};
    box-sizing: border-box;
    height: 100%;
    padding: 16px;
    text-align: center;
  `
);

export const Preview = styled("div")`
  align-items: center;
  background-color: ${({ theme }) => theme.tokens.current.core.layer["01"]};
  box-sizing: border-box;
  display: flex;
  height: 100%;
  justify-content: center;
  overflow: auto;
  padding: 24px;
`;

export const Tabs = styled("div")`
  padding: 8px;
`;

export const DragOverlayItem = styled("div")(
  ({ theme }) => css`
    ${theme.typography.body2Regular}
    align-items: center;
    background-color: ${theme.tokens.current.core.background.default};
    border: 1px solid ${theme.tokens.current.core.border.strong};
    border-radius: 6px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
    color: ${theme.tokens.current.core.text.primary};
    cursor: grabbing;
    display: inline-flex;
    padding: 8px 10px;
    user-select: none;
    white-space: nowrap;
  `
);
