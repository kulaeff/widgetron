import styled from "styled-components";

export const Container = styled.div`
  box-sizing: border-box;
  height: 100%;
  overflow: auto;
  padding: 16px;
  .shiki,
  .shiki span {
    color: var(--shiki-light) !important;
    background-color: var(--shiki-light-bg) !important;
  }
  pre {
    margin: 0;
  }
  & > div {
    width: fit-content;
  }
`;
