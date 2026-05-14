import { useRef, useEffect, type FC, type TextareaHTMLAttributes } from "react";
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

    ref.style.height = "0px";
    ref.style.height = `${Math.min(ref.scrollHeight, 160)}px`;
  };

  useEffect(() => {
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
