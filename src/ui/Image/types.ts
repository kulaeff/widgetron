import { AllHTMLAttributes } from "react";
import { RequiredProperty } from "../types";

export type ImageProps = RequiredProperty<
  Pick<AllHTMLAttributes<HTMLImageElement>, "alt" | "height" | "src" | "width">,
  "src"
>;
