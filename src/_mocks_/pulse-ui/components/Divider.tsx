type Props = {
  orientation?: "horizontal" | "vertical";
  [key: string]: unknown;
};

export function Divider({ orientation = "horizontal", ...props }: Props) {
  return <hr {...props} data-orientation={orientation} />;
}
