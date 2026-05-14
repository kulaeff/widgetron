import type { CSSProperties, FC, PropsWithChildren } from "react";
import * as Styled from "./styled";

export type IslandProps = PropsWithChildren<{
  title?: string;
  style?: CSSProperties;
  minHeight?: CSSProperties["minHeight"];
  maxHeight?: CSSProperties["maxHeight"];
  minWidth?: CSSProperties["minWidth"];
  maxWidth?: CSSProperties["maxWidth"];
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  unstyled?: boolean;
}>;

export const Island: FC<IslandProps> = ({
  children,
  title,
  style,
  minHeight,
  maxHeight,
  minWidth,
  maxWidth,
  width,
  height,
  unstyled = false,
}) => {
  return (
    <Styled.Island
      $height={height}
      $minHeight={minHeight}
      $maxHeight={maxHeight}
      $minWidth={minWidth}
      $maxWidth={maxWidth}
      $width={width}
      $unstyled={unstyled}
      style={style}
    >
      {title ? <Styled.Title>{title}</Styled.Title> : null}
      {children}
    </Styled.Island>
  );
};
