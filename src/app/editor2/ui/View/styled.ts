import styled, { css } from "styled-components";

export const View = styled.div(
  () => css`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 100%;
    width: 100%;
  `
);
