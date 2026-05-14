import { useRef, useLayoutEffect, type FC, type TextareaHTMLAttributes } from "react";
import * as Styled from "./styled";

type PromptProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "id" | "rows"
>;

export const Prompt: FC<PromptProps> = ({ value, ...rest }) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const setHeight = () => {
    const ref = textAreaRef.current;

    if (!ref) return;

    const maxHeight = Number.parseFloat(window.getComputedStyle(ref).maxHeight);

    ref.style.height = "0px";

    const contentHeight = ref.scrollHeight;
    const nextHeight =
      Number.isFinite(maxHeight) && maxHeight > 0
        ? Math.min(contentHeight, maxHeight)
        : contentHeight;

    ref.style.height = `${nextHeight}px`;
    ref.style.overflowY =
      Number.isFinite(maxHeight) && contentHeight > maxHeight ? "auto" : "hidden";
  };

  useLayoutEffect(() => {
    setHeight();
  }, [value]);

  return (
    <Styled.TextArea
      ref={textAreaRef}
      {...rest}
      id="textAreaPrompt"
      rows={1}
      value={value}
    />
  );
};
