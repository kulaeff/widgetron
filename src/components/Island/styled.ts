import styled from "styled-components";

type IslandStyleProps = {
  $width?: string | number;
  $height?: string | number;
  $unstyled: boolean;
};

export const Island = styled("div")<IslandStyleProps>(
  ({
    theme,
    $width,
    $height,
    $unstyled,
  }) => ({
    backgroundColor: theme.tokens.current.core.background.default,
    border: $unstyled
      ? "none"
      : `1px solid ${theme.tokens.current.core.border.strong}`,
    borderRadius: 8,
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
    boxSizing: "border-box",
    padding: $unstyled ? 0 : "16px",
    ...(typeof $width !== "undefined" ? { width: $width } : {}),
    ...(typeof $height !== "undefined" ? { height: $height } : {}),
  })
);

export const Title = styled("div")(({ theme }) => ({
  ...theme.typography.captionRegular,
  color: theme.tokens.current.core.text.secondary,
  marginBottom: 8,
}));
