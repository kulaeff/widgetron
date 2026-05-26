import type { ZodObject } from "zod";
import type { JSONSchema } from "zod/v4/core";
import { catalog } from "../lib/catalog";

export interface CatalogField {
  default?: boolean | number | string;
  description?: string | null;
  name: string;
  optional?: boolean;
  type: string;
}

export interface CatalogComponentInfo {
  name: string;
  example?: unknown;
  icon?: string;
  group: string;
  description: string;
  props: CatalogField[];
  slots: string[];
  events: string[];
}

export interface CatalogActionInfo {
  name: string;
  description: string;
  params: CatalogField[];
}

export interface CatalogFunctionInfo {
  name: string;
  description: string;
  params: CatalogField[];
}

export interface CatalogDisplayData {
  components: CatalogComponentInfo[];
  actions: CatalogActionInfo[];
  functions: CatalogFunctionInfo[];
}

const parseDef = (def: JSONSchema._JSONSchema): string => {
  if (typeof def === "boolean") {
    return "boolean";
  }

  if (def.anyOf) {
    return def.anyOf
      .filter((item) => item.type !== "null")
      .map((item) => parseDef(item))
      .join(" | ");
  }

  if (def.type === "array") {
    return `${
      def.items && typeof def.items === "object" && !Array.isArray(def.items)
        ? parseDef(def.items)
        : "unknown"
    }[]`;
  }

  if (def.type === "number" && "const" in def) {
    return String(def.const);
  }

  if (def.type === "string" && def.enum) {
    return def.enum.join(" | ");
  }

  return def.type ?? "unknown";
};

const parseDefault = (value: unknown): CatalogField["default"] => {
  if (
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  ) {
    return value;
  }

  return undefined;
};

export function parseProps(zodObject: ZodObject) {
  if (!zodObject) return [];

  const schema = zodObject.toJSONSchema({ unrepresentable: "any" });

  return Object.entries(schema.properties ?? {}).map<CatalogField>(([name, def]) => {
    // TODO: add support for dates
    return {
      default: typeof def !== "boolean" ? parseDefault(def.default) : undefined,
      description: typeof def !== "boolean" ? def.description ?? null : null,
      name,
      optional: !schema.required?.includes(name),
      type: parseDef(def),
    };
  });
}

export function buildCatalogData(
  data: typeof catalog.data
): CatalogDisplayData {
  const components = Object.entries(data.components ?? {})
    .map(([name, schema]) => ({
      name,
      group: schema.group ?? "",
      description: schema.description ?? "",
      props: parseProps(schema.props),
      slots: "slots" in schema ? schema.slots ?? [] : [],
      events: "events" in schema ? schema.events ?? [] : [],
      example: "example" in schema ? schema.example ?? null : null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const actions = Object.entries(data.actions ?? {})
    .map(([name, schema]) => ({
      name,
      description: schema.description ?? "",
      params: parseProps(schema.params),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const functions = Object.entries(data.functions ?? {})
    .map(([name, schema]) => ({
      name,
      description: schema.description ?? "",
      params: parseProps(schema.params),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { components, actions, functions };
}
