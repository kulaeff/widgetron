import { FC } from "react";
import type { HTMLAttributes } from "react";
import * as Styled from "./styled";

type Props = HTMLAttributes<HTMLHRElement>;

export const Divider: FC<Props> = (props) => {
  return <Styled.Divider {...props} />;
}
