import { JSONUIProvider, Renderer as JSONUIRenderer } from "@json-render/react";
import type { SetState } from "@json-render/react";
import type { Spec } from "@json-render/core";
import { useMemo, useRef, type FC } from "react";
import {
  registry,
  handlers as createHandlers,
  Fallback,
} from "../../lib/registry";

export interface RendererProps {
  loading?: boolean;
  spec: Spec;
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
  const stateRef = useRef(state);
  const setStateRef = useRef(setState);

  stateRef.current = state;
  setStateRef.current = setState;

  const handlers = useMemo(
    () =>
      createHandlers(
        () => setStateRef.current,
        () => stateRef.current
      ),
    []
  );

  return (
    <JSONUIProvider
      initialState={state}
      registry={registry}
      functions={{
        formatCurrency: (args) => {
          const value = Number(args.value);

          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: (args.currency as string) ?? "USD",
          }).format(value);
        },
        formatDate: (args) => {
          const value = new Date(Number(args.value ?? 0));

          return new Intl.DateTimeFormat("en-US", {
            dateStyle:
              (args.style as Intl.DateTimeFormatOptions["dateStyle"]) ??
              "short",
          }).format(value);
        },
        formatList: (args) => {
          const value = (args.value as string[]) ?? [];

          return new Intl.ListFormat("en-US", {
            style: (args.style as Intl.ListFormatOptions["style"]) ?? "short",
          }).format(value);
        },
        formatNumber: (args) => {
          const value = Number(args.value);

          return new Intl.NumberFormat("en-US", { style: "decimal" }).format(
            value
          );
        },
        formatPercent: (args) => {
          const value = Number(args.value);

          return new Intl.NumberFormat("en-US", { style: "percent" }).format(
            value
          );
        },
        formatPlurals: (args) => {
          const value = Number(args.value);

          const rule = new Intl.PluralRules("en-US").select(value);

          return (
            (args.rules as Record<string, string>)[rule] ??
            (args.rules as Record<string, string>).other
          );
        },
        formatTime: (args) => {
          const value = new Date(Number(args.value ?? 0));

          return new Intl.DateTimeFormat("en-US", {
            timeStyle:
              (args.style as Intl.DateTimeFormatOptions["timeStyle"]) ??
              "short",
          }).format(value);
        },
        formatUnit: (args) => {
          const value = Number(args.value);

          return new Intl.NumberFormat("en-US", {
            style: "unit",
            unit: args.unit as string,
          }).format(value);
        },
      }}
      handlers={handlers}
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
