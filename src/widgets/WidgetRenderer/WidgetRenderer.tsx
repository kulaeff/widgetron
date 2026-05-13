import type { Spec } from "@json-render/core";
import type { SetState } from "@json-render/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Renderer,
  type RendererProps,
} from "../../components/Renderer";

export interface WidgetRendererProps {
  loading?: boolean;
  onStateChange?: RendererProps["onStateChange"];
  spec: Spec | null;
  state?: Record<string, unknown>;
}

export function WidgetRenderer({
  loading,
  onStateChange,
  spec,
  state,
}: WidgetRendererProps) {
  const [internalState, setInternalState] = useState<Record<string, unknown>>(
    () => state ?? spec?.state ?? {}
  );

  useEffect(() => {
    if (state) {
      setInternalState(state);
    }
  }, [state]);

  const setState: SetState = useCallback((updater) => {
    setInternalState((prev) => updater(prev));
  }, []);

  const effectiveSpec = useMemo<Spec>(
    () =>
      spec ?? {
        elements: {},
        root: "",
        state: {},
      },
    [spec]
  );

  const effectiveState = useMemo(
    () => ({
      ...(effectiveSpec.state ?? {}),
      ...internalState,
      ...(state ?? {}),
    }),
    [effectiveSpec.state, internalState, state]
  );

  return (
    <Renderer
      loading={loading}
      onStateChange={onStateChange}
      setState={setState}
      spec={effectiveSpec}
      state={effectiveState}
    />
  );
}
