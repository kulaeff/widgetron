import type { FC } from "react";
import type { ImageProps } from "./types";

export const Image: FC<ImageProps> = ({
  alt,
  height = 64,
  width = 64,
  src,
}) => {
  if (typeof src !== "string") {
    return JSON.stringify(src);
  }

  return <img alt={alt ?? ""} height={height} src={src} width={width} />;
};
