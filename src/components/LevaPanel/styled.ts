import styled, { css } from "styled-components";

export const Container = styled.div`
  height: 100%;
  padding: 24px;
`;

export const Control = styled.div`
  align-items: center;
  display: grid;
  gap: 16px;
  grid-template-columns: auto 1fr;
  justify-content: space-between;
  margin-top: 16px;
`;

export const Header = styled.div`
  align-items: center;
  display: grid;
  gap: 8px;
  grid-template-columns: auto 1fr;
`;

export const Name = styled.span(
  ({ theme }) => css`
    color: ${theme.tokens.current.core.text.secondary};
    display: block;
  `
);

export const Panel = styled.div`
  padding: 16px;
`;

export const Sections = styled.section`
  align-items: center;
  display: grid;
  gap: 8px;
  grid-template-columns: auto 1fr auto;
  justify-content: space-between;
  margin-top: 16px;
`;
