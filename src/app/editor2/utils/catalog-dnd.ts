import type { CatalogComponentInfo, CatalogField } from "./catalog-data";

export const CATALOG_COMPONENT_MIME = "application/x-catalog-component";

export type CatalogDragPayload = {
  componentName: string;
  group: string;
};

const BASE_TYPE_TOKENS = new Set([
  "string",
  "number",
  "boolean",
  "unknown",
  "object",
]);

const parseUnionTokens = (type: string): string[] =>
  type
    .split("|")
    .map((token) => token.trim())
    .filter(Boolean);

const parseNumberToken = (token: string): number | null => {
  const value = Number(token);
  return Number.isFinite(value) ? value : null;
};

const defaultStringValue = (
  propName: string,
  componentName: string
): string => {
  const normalizedName = propName.toLowerCase();
  if (normalizedName.includes("text")) return `New ${componentName}`;
  if (normalizedName.includes("label")) return `New ${componentName}`;
  if (normalizedName === "name") return componentName;
  if (normalizedName === "alt") return `${componentName} image`;
  if (normalizedName === "to" || normalizedName.includes("url")) return "#";
  return "";
};

const defaultValueFromType = (
  field: CatalogField,
  componentName: string
): unknown => {
  const rawType = field.type.replace("?", "").trim();
  const unionTokens = parseUnionTokens(rawType);
  const firstToken = unionTokens[0] ?? "";

  if (
    rawType.endsWith("[]") ||
    unionTokens.some((token) => token.endsWith("[]"))
  ) {
    return [];
  }

  if (unionTokens.length > 1) {
    const looksLikeEnum = unionTokens.every(
      (token) => !BASE_TYPE_TOKENS.has(token) && !token.endsWith("[]")
    );
    if (looksLikeEnum) {
      const asNumber = parseNumberToken(firstToken);
      return asNumber ?? firstToken;
    }
  }

  if (rawType.includes("boolean")) return false;
  if (rawType.includes("number")) return 0;
  if (rawType.includes("string"))
    return defaultStringValue(field.name, componentName);
  if (rawType.includes("object") || rawType.includes("record")) return {};

  const literalNumber = parseNumberToken(firstToken);
  if (literalNumber !== null) return literalNumber;

  return {};
};

export const buildSafeDefaultProps = (
  component: CatalogComponentInfo
): Record<string, unknown> => {
  return component.props.reduce<Record<string, unknown>>((acc, field) => {
    const propName = field.name.replace("?", "");
    acc[propName] = defaultValueFromType(field, component.name);
    return acc;
  }, {});
};

export const encodeCatalogDragPayload = (payload: CatalogDragPayload): string =>
  JSON.stringify(payload);

export const decodeCatalogDragPayload = (
  value: string
): CatalogDragPayload | null => {
  try {
    const parsed = JSON.parse(value) as Partial<CatalogDragPayload>;
    if (
      !parsed ||
      typeof parsed.componentName !== "string" ||
      typeof parsed.group !== "string"
    ) {
      return null;
    }
    return { componentName: parsed.componentName, group: parsed.group };
  } catch {
    return null;
  }
};
