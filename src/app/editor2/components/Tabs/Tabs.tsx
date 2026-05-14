import type { FC } from "react";
import * as Styled from "./styled";

interface TabsItem extends Record<string, unknown> {
  id: string;
  label: string;
}

type TabsProps = {
  items: TabsItem[];
  value?: string;
  onChange?: (id: string) => void;
};

export const Tabs: FC<TabsProps> = ({ items, value, onChange }) => {
  return (
    <Styled.Tabs>
      {items.map((item, index) => (
        <Styled.Tab
          key={item.id}
          $isSelected={value === item.id}
          onClick={() => onChange?.(item.id)}
        >
          {item.label}
        </Styled.Tab>
      ))}
    </Styled.Tabs>
  );
}
