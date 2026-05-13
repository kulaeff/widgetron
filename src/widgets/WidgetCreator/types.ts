import type { Spec } from "@json-render/core";

export interface WidgetCreatorDataSource {
  method: string;
  type: string;
  url: string;
}

export interface WidgetCreatorSavePayload {
  data: unknown | null;
  dataSource: WidgetCreatorDataSource;
  scheme: Spec;
}

export interface WidgetCreatorProps {
  onSave?: (payload: WidgetCreatorSavePayload) => void | Promise<void>;
}
