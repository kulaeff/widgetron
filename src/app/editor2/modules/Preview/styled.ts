import styled, { css } from "styled-components";

export const Container = styled.div<{ $selected?: boolean }>(({ $selected }) => css`
  background-color: rgba(255, 255, 255, 0.44);
  border: 1px solid rgba(255, 255, 255, 1);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  min-width: 294px;
  outline: ${$selected ? "1px solid rgba(35, 111, 255, 0.9)" : "none"};
  padding: 20px;
`);
