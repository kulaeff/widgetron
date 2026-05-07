import { Loader } from "@pulse/ui/components/Loader";
import type { FC } from "react";
import * as Styled from "./styled";
import type { Version } from "../../pages/Home/types";

export type VersionsProps = {
  disabled?: boolean;
  items: Version[];
  value?: string;
  onChange?: (id: string) => void;
};

export const Versions: FC<VersionsProps> = ({
  disabled = false,
  items,
  value,
  onChange,
}) => {
  const handleClick = (id: string) => {
    onChange?.(id);
  };

  return (
    <Styled.Container>
      {items.map((item, i) => (
        <Styled.Item
          key={item.id}
          $isDisabled={disabled}
          $isSelected={value === item.id}
          onClick={() => handleClick(item.id)}
        >
          <Styled.Content>
            <Styled.Id>{`v${i + 1}`}</Styled.Id>
            <Styled.Main>
              <Styled.Prompt>{item.prompt}</Styled.Prompt>
              <Styled.Tokens>
                {item.usage
                  ? `${item.usage.prompt} промпт · ${item.usage.completion} ответ`
                  : "—"}
              </Styled.Tokens>
            </Styled.Main>
            {item.status === "pending" ? <Loader /> : null}
          </Styled.Content>
        </Styled.Item>
      ))}
    </Styled.Container>
  );
};
