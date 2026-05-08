import styled, { css } from "styled-components";

export const Container = styled("div")({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  overflow: "hidden",
});

export const Workspace = styled("div")`
  height: 100%;
  overflow: hidden;
  position: relative;
`;

export const ModeSwitch = styled("div")(
  ({ theme }) => css`
    ${theme.typography.body2Regular}
    align-items: center;
    color: ${theme.tokens.current.core.text.secondary};
    display: inline-flex;
    gap: 8px;
  `
);

export const ModeLabel = styled("span")<{ $active?: boolean }>(
  ({ $active, theme }) => css`
    color: ${$active
      ? theme.tokens.current.core.text.primary
      : theme.tokens.current.core.text.secondary};
    transition: color 0.15s ease;
  `
);

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
  box-sizing: border-box;
  display: flex;
  height: 100%;
  justify-content: center;
  overflow: auto;
`;

export const Tabs = styled("div")`
  overflow-x: auto;
  padding: 8px;
  white-space: nowrap;
`;

export const ComponentPickerSurface = styled("div")`
  height: 100%;
  min-height: 0;
  overflow: hidden;
`;

export const CodePanel = styled("div")`
  height: 100%;
  min-height: 0;
  position: relative;
`;

export const CodeExpandButton = styled("button")`
  align-items: center;
  background: ${({ theme }) => theme.tokens.current.core.background.default};
  border: 1px solid ${({ theme }) => theme.tokens.current.core.border.strong};
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  color: ${({ theme }) => theme.tokens.current.core.text.secondary};
  cursor: pointer;
  display: flex;
  font: inherit;
  height: 32px;
  justify-content: center;
  line-height: 1;
  padding: 0;
  position: absolute;
  right: 28px;
  top: 8px;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
  width: 32px;
  z-index: 2;

  &:hover {
    background: ${({ theme }) => theme.tokens.current.core.layer["01"]};
    border-color: ${({ theme }) => theme.tokens.current.colors.blue.solid[30]};
    color: ${({ theme }) => theme.tokens.current.core.text.primary};
  }
`;

export const CodeModalBackdrop = styled("div")`
  align-items: center;
  background: rgba(15, 23, 42, 0.28);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 24px;
  position: fixed;
  z-index: 40;
`;

export const CodeModal = styled("div")`
  background: ${({ theme }) => theme.tokens.current.core.background.default};
  border: 1px solid ${({ theme }) => theme.tokens.current.core.border.strong};
  border-radius: 8px;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.24);
  display: grid;
  grid-template-rows: auto 1fr;
  height: min(760px, calc(100vh - 48px));
  max-width: 1120px;
  min-height: 0;
  overflow: hidden;
  width: min(1120px, calc(100vw - 48px));
`;

export const CodeModalHeader = styled("div")`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.tokens.current.core.border.strong};
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
`;

export const CodeModalTitle = styled("div")`
  ${({ theme }) => theme.typography.body1Semibold};
  color: ${({ theme }) => theme.tokens.current.core.text.primary};
`;

export const CodeModalBody = styled("div")`
  min-height: 0;
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
