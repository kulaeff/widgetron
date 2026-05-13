import { ReactFlowProvider } from "@xyflow/react";
import { Home } from "../../pages/Home/Home";
import type { WidgetCreatorProps } from "./types";
import { Wrapper } from "./styled";

export function WidgetCreator({ onSave }: WidgetCreatorProps) {
  return (
    <ReactFlowProvider>
      <Wrapper>
        <Home onSave={onSave} />
      </Wrapper>
    </ReactFlowProvider>
  );
}
