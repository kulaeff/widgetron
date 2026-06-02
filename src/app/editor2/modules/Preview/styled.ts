import styled, { css } from "styled-components";

export const Tile = styled.div<{ $selected?: boolean }>(
  ({ $selected, theme }) => css`
    background-color: rgba(255, 255, 255, 0.44);
    border: 1px solid rgba(255, 255, 255, 1);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    min-width: 294px;
    padding: 20px;
    position: relative;
    transition: outline-width 60ms;
    ${$selected ? css`
      outline: 4px solid ${theme.tokens.current.system["30"]};
    ` : css`
      &:hover {
        outline: 4px solid ${theme.tokens.current.core.border.strong};
      }
    `}
  `
);

export const Highlight = styled.div(
  ({ theme }) => css`
    border: 2px solid ${theme.tokens.current.core.accent.primary};
    pointer-events: none;
    position: absolute;
    z-index: 1000;
  `
);

export const Hover = styled.div(
  ({ theme }) => css`
    border: 2px solid ${theme.tokens.current.core.border.strong};
    pointer-events: none;
    position: absolute;
    z-index: 1000;
  `
);
