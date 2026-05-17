import styled, { css } from 'styled-components';

export const Dropdown = styled.div(({ theme }) => css`
  ${theme.typography.body2Regular};
  background: ${theme.tokens.current.core.background.default};
  border: 1px solid ${theme.tokens.current.core.border.strong};
  border-radius: 8px;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  color: ${theme.tokens.current.core.text.primary};
  margin: 0;
  opacity: 0;
  padding: 8px;
  transition: opacity 60ms;

  &:popover-open {
    opacity: 1;
  }

  @starting-style {
    &:popover-open {
      opacity: 0;
    }
  }
`);
