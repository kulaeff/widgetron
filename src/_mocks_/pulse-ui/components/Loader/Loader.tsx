import type { FC, SVGAttributes } from "react";

interface LoaderProps extends SVGAttributes<SVGSVGElement> {
  size?: "sm" | "md" | "lg";
  [key: string]: unknown;
}

export const Loader: FC<LoaderProps> = ({ size = "md", ...props }) => {
  const pxBySize = {
    sm: 12,
    md: 16,
    lg: 20,
  } as const;

  const spinnerSize = pxBySize[size];

  return (
    <svg
      {...props}
      aria-label="Loading"
      fill="none"
      height={spinnerSize}
      role="status"
      viewBox="0 0 24 24"
      width={spinnerSize}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
