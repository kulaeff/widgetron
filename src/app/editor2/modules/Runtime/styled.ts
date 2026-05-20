import styled, { css } from "styled-components";

export const Runtime = styled.div(({ theme }) => css`
  align-items: center;
  background: linear-gradient(135deg, beige, ${theme.tokens.current.colors.blue.solid[10]});
  display: flex;
  height: 100%;
  justify-content: center;
`);

export const Tile = styled.div`
  background-color: rgba(255, 255, 255, 0.44);
  border: 1px solid rgba(255, 255, 255, 1);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  min-height: 280px;
  min-width: 294px;
  padding: 20px;
`;
