import { ReactFlowProvider } from "@xyflow/react";
import { Home } from "../../pages/Home/Home";

export function WidgetCreator() {
  return (
    <ReactFlowProvider>
      <Home />
    </ReactFlowProvider>
  );
}
