import { forwardRef, type PropsWithChildren } from "react";
import type { ModalProps } from "./types";
import * as Styled from "./styled";

export const Modal = forwardRef<HTMLDialogElement, PropsWithChildren<ModalProps>>((props, ref) => {
  const { children, ...rest } = props;

  return (
    <Styled.Dialog
      {...rest}
      ref={ref}
    >
      {children}
    </Styled.Dialog>
  );
});

Modal.displayName = "Modal";
