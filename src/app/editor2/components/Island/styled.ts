import styled from "styled-components";

type IslandStyleProps = {
  $height?: string | number;
  $minHeight?: string | number;
  $maxHeight?: string | number;
  $minWidth?: string | number;
  $maxWidth?: string | number;
  $width?: string | number;
  $unstyled: boolean;
};

export const Island = styled("div")<IslandStyleProps>(
  ({
    theme,
    $height,
    $minHeight,
    $maxHeight,
    $minWidth,
    $maxWidth,
    $width,
    $unstyled,
  }) => ({
    backgroundColor: $unstyled ? "transparent" : theme.tokens.current.core.background.default,
    border: $unstyled
      ? "none"
      : `1px solid ${theme.tokens.current.core.border.strong}`,
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    boxSizing: "border-box",
    display: "grid",
    gridTemplateRows: "minmax(0, 1fr)",
    padding: $unstyled ? 0 : "16px",
    ...(typeof $width !== "undefined" ? { width: $width } : {}),
    ...(typeof $height !== "undefined" ? { height: $height } : {}),
    ...(typeof $minHeight !== "undefined" ? { minHeight: $minHeight } : {}),
    ...(typeof $maxHeight !== "undefined" ? { maxHeight: $maxHeight } : {}),
    ...(typeof $minWidth !== "undefined" ? { minWidth: $minWidth } : {}),
    ...(typeof $maxWidth !== "undefined" ? { maxWidth: $maxWidth } : {}),
  })
);

export const Title = styled("div")(({ theme }) => ({
  ...theme.typography.captionRegular,
  color: theme.tokens.current.core.text.secondary,
  marginBottom: 8,
}));
