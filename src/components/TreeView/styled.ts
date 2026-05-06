import styled from "styled-components";

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

export const Container = styled.ul<{ $isRoot?: boolean }>`
  margin: 0;
  padding: ${({ $isRoot }) => ($isRoot ? "8px" : 0)};
`;

export const Item = styled.li<{ $isSelected?: boolean }>`
  background-color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.tokens.current.colors.blue.solid[10] : "transparent"};
  border-radius: 4px;
  list-style: none;
  margin: 4px 0 0 0;
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
  position: relative;
  outline: ${({ $dragPlacement }) =>
    $dragPlacement === "inside" ? "1px solid rgba(0, 0, 0, 0.5)" : "none"};
  padding: 8px;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Spacer = styled.span`
  display: block;
  height: 16px;
  width: 16px;
`;

export const Text = styled.span`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
