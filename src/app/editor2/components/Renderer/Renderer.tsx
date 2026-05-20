import type { Spec } from "@json-render/core";
import { standardDirectives } from "@json-render/directives";
import { JSONUIProvider, Renderer as JSONUIRenderer, type SetState } from "@json-render/react";
import { useMemo, useRef, type FC } from "react";
import {
  registry,
  handlers as createHandlers,
  Fallback,
} from "../../lib/registry";

export interface RendererProps {
  loading?: boolean;
  spec: Spec | null;
  state: Record<string, unknown>;
  setState: SetState;
  onStateChange?: (changes: Array<{ path: string; value: unknown }>) => void;
}

export const Renderer: FC<RendererProps> = ({
  loading,
  spec,
  state,
  setState,
  onStateChange,
}) => {
  const handlers = useMemo(
    () =>
      createHandlers(
        () => setState,
        () => state
      ),
    [state, setState]
  );

  return (
    <JSONUIProvider
      directives={standardDirectives}
      handlers={handlers}
      initialState={state}
      registry={registry}
      onStateChange={onStateChange}
    >
      <JSONUIRenderer
        fallback={({ element }) => <Fallback type={element.type} />}
        loading={loading}
        registry={registry}
        spec={spec}
      />
    </JSONUIProvider>
  );
};
