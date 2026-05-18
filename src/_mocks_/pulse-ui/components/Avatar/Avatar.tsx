import type { AvatarProps } from "./types";
import * as Styled from "./styled";

export function Avatar({
  $hasBadge,
  $icon,
  $label,
  $size,
  $text,
  ...props
}: AvatarProps) {
  const resolvedHasBadge = $hasBadge ?? false;
  const resolvedLabel = $label;
  const resolvedSize = $size ?? "l";
  const resolvedText = $text ?? "Avatar";
  const resolvedUrl = $icon;

  const domProps = Object.fromEntries(
    Object.entries(props).filter(([key]) => !key.startsWith("$"))
  );
  const hasLabel = typeof resolvedLabel === "string" && resolvedLabel.length > 0;
  const fallbackText =
    typeof resolvedText === "string" && resolvedText.length > 0
      ? resolvedText.slice(0, 2).toUpperCase()
      : "AV";

  return (
    <Styled.Avatar
      {...domProps}
      $size={resolvedSize}
    >
      {resolvedUrl ? (
        <Styled.AvatarImage
          src={resolvedUrl}
          alt={resolvedLabel ?? resolvedText}
        />
      ) : (
        <Styled.AvatarText $size={resolvedSize}>{fallbackText}</Styled.AvatarText>
      )}
      {resolvedHasBadge ? <Styled.Badge /> : null}
      {hasLabel ? <Styled.Label>{resolvedLabel}</Styled.Label> : null}
    </Styled.Avatar>
  );
}
