import { Loader } from "@pulse/ui/components/Loader";
import { useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import type { Version } from "../../types";
import * as Styled from "./styled";
import { Divider } from "@pulse/ui/components/Divider";

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
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (id: string) => {
    onChange?.(id);
  };

  return (
    <Styled.Versions>
      <Styled.List>
        <Styled.Items>
          {isOpen && items.map((item, i) => (
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
        </Styled.Items>
      </Styled.List>
      {isOpen ? <Divider /> : null}
      <Styled.Button
        type="button"
        disabled={items.length === 0}
        onClick={() => setIsOpen((p) => !p)}
      >
        <Styled.Label>
          {t("версии")}
        </Styled.Label>
        <Styled.Arrow
          $open={isOpen}
          aria-hidden="true"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Styled.Arrow>
      </Styled.Button>
    </Styled.Versions>
  );
};
