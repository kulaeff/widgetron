import styled, { css } from 'styled-components';

export const Root = styled.div`
  position: relative;
`;

export const Dropdown = styled.div(({ theme }) => css`
  ${theme.typography.body2Regular};
  background: ${theme.tokens.current.core.background.default};
  border: 1px solid ${theme.tokens.current.core.border.strong};
  border-radius: 8px;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  color: ${theme.tokens.current.core.text.primary};
  margin: 0;
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  padding: 8px;
  z-index: 10;
`);
