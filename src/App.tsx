import { Outlet } from "react-router-dom";
import styled from "styled-components";

const Root = styled.div`
  height: 100%;
`;

export function App() {
  return (
    <Root>
      <Outlet />
    </Root>
  );
}
