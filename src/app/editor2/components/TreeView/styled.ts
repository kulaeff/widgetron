import styled, { css } from "styled-components";

export const Arrow = styled.button<{
  $isCollapsed: boolean;
}>`
  appearance: none;
  background-color: transparent;
  border: none;
  color: rgba(0, 0, 0, 0.5);
  margin: 0;
  outline: none;
  padding: 0;
  transform: ${({ $isCollapsed }) =>
    $isCollapsed ? "rotateZ(0deg)" : "rotateZ(90deg)"};
  transition: opacity 40ms, transform 40ms ease-out;
  & > svg {
    display: block;
  }
`;

export const TreeView = styled.ul<{
  $isCatalogDropTarget?: boolean;
  $isRoot?: boolean;
}>`
  background-color: ${({ $isCatalogDropTarget, theme }) =>
    $isCatalogDropTarget ? theme.tokens.current.colors.blue.solid[10] : "transparent"};
  box-sizing: border-box;
  border: ${({ $isCatalogDropTarget, theme }) =>
    $isCatalogDropTarget
      ? `1px dashed ${theme.tokens.current.colors.blue.solid[60]}`
      : "1px dashed transparent"};
  border-radius: 6px;
  height: ${({ $isRoot }) => ($isRoot ? "100%" : "auto")};
  margin: 0;
  min-height: ${({ $isRoot }) => ($isRoot ? "100%" : "0")};
  overflow: ${({ $isRoot }) => ($isRoot ? "auto" : "visible")};
  padding: 0;
  transition: background-color 120ms ease, border-color 120ms ease;
`;

export const EmptyDropZone = styled.li<{ $isActive?: boolean }>`
  ${({ theme }) => theme.typography.body2Regular};
  align-items: center;
  border: ${({ $isActive, theme }) =>
    $isActive
      ? `1px dashed ${theme.tokens.current.colors.blue.solid[60]}`
      : `1px dashed ${theme.tokens.current.core.border.strong}`};
  border-radius: 6px;
  color: ${({ $isActive, theme }) =>
    $isActive
      ? theme.tokens.current.colors.blue.solid[60]
      : theme.tokens.current.core.text.secondary};
  display: flex;
  height: 100%;
  justify-content: center;
  list-style: none;
  min-height: 160px;
  padding: 16px;
  text-align: center;
  transition: border-color 120ms ease, color 120ms ease;
`;

export const Item = styled.li<{ $isSelected?: boolean }>`
  border-radius: 4px;
  list-style: none;
  margin: 2px 0 0 0;
  padding: 0;
`;

export const Content = styled.div<{
  $dragPlacement: "inside" | "before" | "after" | null;
  $isDetached: boolean;
  $isSelected: boolean;
}>`
  align-items: center;
  background-color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.tokens.current.colors.blue.solid[20] : "transparent"};
  border-radius: 4px;
  display: grid;
  gap: 4px;
  grid-template-columns: auto 1fr;
  min-width: 0;
  position: relative;
  outline: ${({ $dragPlacement }) =>
    $dragPlacement === "inside" ? "1px solid rgba(0, 0, 0, 0.5)" : "none"};
  padding: 6px 8px;
  color: ${({ $isDetached }) => ($isDetached ? "rgba(180, 48, 48, 0.9)" : "inherit")};
  transition: background-color 40ms, color 40ms;
  user-select: none;
  &::before,
  &::after {
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 1px;
    content: "";
    height: 2px;
    left: var(--drop-line-offset, 0px);
    pointer-events: none;
    position: absolute;
    right: 0;
  }
  &::before {
    opacity: ${({ $dragPlacement }) => ($dragPlacement === "before" ? 1 : 0)};
    top: -1px;
  }
  &::after {
    bottom: -1px;
    opacity: ${({ $dragPlacement }) => ($dragPlacement === "after" ? 1 : 0)};
  }
  &:hover {
    background-color: ${({ $isSelected, theme }) =>
      $isSelected
        ? theme.tokens.current.colors.blue.solid[30]
        : "rgba(0, 0, 0, 0.05)"};
  }
`;

export const Label = styled.div`
  align-items: center;
  display: grid;
  gap: 4px;
  grid-template-columns: 1fr auto;
  justify-content: space-between;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Spacer = styled.span`
  display: block;
  height: 16px;
  width: 16px;
`;

export const Text = styled.span(({ theme }) => css`
  ${theme.typography.body2Regular};
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`);

export const TypeBadge = styled.span(({ theme }) => css`
  ${theme.typography.captionRegular};
  background: ${theme.tokens.current.core.layer["01"]};
  border: 1px solid ${theme.tokens.current.core.border.strong};
  border-radius: 4px;
  color: ${theme.tokens.current.core.text.secondary};
  max-width: 112px;
  overflow: hidden;
  padding: 0 4px;
  text-overflow: ellipsis;
  white-space: nowrap;
`);
