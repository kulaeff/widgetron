import type { CSSProperties, FC, PropsWithChildren } from "react";
import { useMemo } from "react";
import * as Styled from "./styled";

type Position = "left" | "right" | "top" | "bottom";

export type IslandProps = PropsWithChildren<{
  title?: string;
  style?: CSSProperties;
  position?: Position | [Position, Position];
  offset?: number | [number, number];
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
}>;

const hasHorizontalPosition = (value: Position) =>
  value === "left" || value === "right";

const hasVerticalPosition = (value: Position) =>
  value === "top" || value === "bottom";

export const Island: FC<IslandProps> = ({
  children,
  title,
  style,
  position = "right",
  offset = 16,
  width,
  height,
}) => {
  const positions = Array.isArray(position) ? position : [position];
  const shouldCenterMissingAxis = positions.length === 1;

  const horizontal = positions.find(hasHorizontalPosition);
  const vertical = positions.find(hasVerticalPosition);

  const transform = useMemo(() => {
    if (!shouldCenterMissingAxis) {
      return undefined;
    }

    if (!horizontal && !vertical) {
      return "translate(-50%, -50%)";
    }

    if (!horizontal) {
      return "translateX(-50%)";
    }

    if (!vertical) {
      return "translateY(-50%)";
    }

    return undefined;
  }, [horizontal, shouldCenterMissingAxis, vertical]);

  return (
    <Styled.Island
      style={style}
      $horizontal={horizontal}
      $vertical={vertical}
      $offset={offset}
      $centerMissingAxis={shouldCenterMissingAxis}
      $transform={transform}
      $width={width}
      $height={height}
    >
      {title ? <Styled.Title>{title}</Styled.Title> : null}
      {children}
    </Styled.Island>
  );
};
