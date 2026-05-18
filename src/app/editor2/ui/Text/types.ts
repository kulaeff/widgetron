import type { HTMLAttributes } from "react";
import type { DefaultTheme } from "styled-components";

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: Extract<
    keyof DefaultTheme["typography"],
    | "body1Regular"
    | "body1Semibold"
    | "body2Regular"
    | "body2Semibold"
    | "captionRegular"
    | "captionSemibold"
    | "extraBodyRegular"
    | "smallTextRegular"
    | "smallTextSemibold"
  >;
  text: string;
}
