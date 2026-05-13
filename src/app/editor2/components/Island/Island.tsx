import type { CSSProperties, FC, PropsWithChildren } from "react";
import * as Styled from "./styled";

export type IslandProps = PropsWithChildren<{
  title?: string;
  style?: CSSProperties;
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  unstyled?: boolean;
}>;

export const Island: FC<IslandProps> = ({
  children,
  title,
  style,
  width,
  height,
  unstyled = false,
}) => {
  return (
    <Styled.Island
      style={style}
      $width={width}
      $height={height}
      $unstyled={unstyled}
    >
      {title ? <Styled.Title>{title}</Styled.Title> : null}
      {children}
    </Styled.Island>
  );
};
