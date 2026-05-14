import { ReactFlowProvider } from "@xyflow/react";
import { Editor } from "../../app/editor2";
import type { WidgetCreatorProps } from "./types";
import { Wrapper } from "./styled";
import '@xyflow/react/dist/style.css';

export function WidgetCreator({ onSave }: WidgetCreatorProps) {
  return (
    <ReactFlowProvider>
      <Wrapper>
        <Editor onSave={onSave} />
      </Wrapper>
    </ReactFlowProvider>
  );
}
