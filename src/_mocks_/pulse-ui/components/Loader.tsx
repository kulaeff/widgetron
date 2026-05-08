type Props = {
  size?: "sm" | "md" | "lg";
  [key: string]: unknown;
};

export function Loader({ size = "md", ...props }: Props) {
  return (
    <span {...props} data-size={size}>
      Loading...
    </span>
  );
}
