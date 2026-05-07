import styled from "styled-components";

type Position = "left" | "right" | "top" | "bottom";

type IslandStyleProps = {
  $horizontal?: Position;
  $vertical?: Position;
  $offset: number | [number, number];
  $centerMissingAxis: boolean;
  $transform?: string;
  $width?: string | number;
  $height?: string | number;
};

const resolveOffsetX = (offset: number | [number, number]) =>
  Array.isArray(offset) ? offset[0] : offset;

const resolveOffsetY = (offset: number | [number, number]) =>
  Array.isArray(offset) ? offset[1] : offset;

export const Island = styled("div")<IslandStyleProps>(
  ({
    theme,
    $horizontal,
    $vertical,
    $offset,
    $centerMissingAxis,
    $transform,
    $width,
    $height,
  }) => {
    const offsetX = resolveOffsetX($offset);
    const offsetY = resolveOffsetY($offset);

    return {
      backgroundColor: theme.tokens.current.core.background.default,
      border: `1px solid ${theme.tokens.current.core.border.strong}`,
      borderRadius: 8,
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.16)",
      boxSizing: "border-box",
      padding: 8,
      position: "fixed",
      ...($horizontal ? { [$horizontal]: offsetX } : {}),
      ...($vertical ? { [$vertical]: offsetY } : {}),
      ...($centerMissingAxis && !$horizontal ? { left: "50%" } : {}),
      ...($centerMissingAxis && !$vertical ? { top: "50%" } : {}),
      ...(typeof $transform === "string" ? { transform: $transform } : {}),
      ...(typeof $width !== "undefined" ? { width: $width } : {}),
      ...(typeof $height !== "undefined" ? { height: $height } : {}),
    };
  }
);

export const Title = styled("div")(({ theme }) => ({
  ...theme.typography.captionRegular,
  color: theme.tokens.current.core.text.secondary,
  marginBottom: 8,
}));
