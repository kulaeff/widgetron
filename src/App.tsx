import { Outlet } from "react-router-dom";
import styled from "styled-components";
import '@xyflow/react/dist/style.css';
import { ReactFlowProvider } from "@xyflow/react";

const Root = styled.div`
  height: 100%;
`;

export function App() {
  return (
    <ReactFlowProvider>
      <Root>
        <Outlet />
      </Root>
    </ReactFlowProvider>
  );
}
