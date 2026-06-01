import styled, { css } from "styled-components";

export const Slider = styled.div`
  height: 100%;
  position: relative;
  overflow: hidden;
  width: 100%;
`;

export const Container = styled.div`
  height: 100%;
  overflow: hidden;
`;

export const Track = styled.div<{ $slidesPerPage: number }>(
  ({ $slidesPerPage }) => css`
    display: flex;
    height: 100%;
    transition: transform 180ms ease-in-out;
    will-change: transform;
    & > * {
      flex: 0 0 calc(100% / ${$slidesPerPage});
    }
  `
);

export const Item = styled.div``;

export const Dots = styled.div`
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  pointer-events: none;
  z-index: 1;
`;

export const Dot = styled.button<{ $active: boolean }>(
  ({ theme, $active }) => css`
    appearance: none;
    border: none;
    margin: 0;
    padding: 4px;
    cursor: pointer;
    pointer-events: auto;
    background: transparent;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0;

    &::before {
      content: "";
      display: block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${$active
        ? theme.tokens.current.colors.blue.solid[60]
        : theme.tokens.current.core.text.secondary};
      opacity: ${$active ? 1 : 0.45};
      transition: background-color 120ms ease, opacity 120ms ease,
        transform 120ms ease;
      transform: scale(${$active ? 1 : 0.88});
    }

    &:hover::before {
      opacity: ${$active ? 1 : 0.75};
    }
  `
);
