import { useViewport } from "@xyflow/react";
import { useState, type FC } from "react";
import { Dropdown } from "../Dropdown";
import { Menu } from "../Menu";
import * as Styled from "./styled";

export type ZoomOption = {
  id: string;
  label: string;
};

type ZoomControlProps = {
  options: ZoomOption[];
  onChange: (id: ZoomOption["id"]) => void;
};

export const ZoomControl: FC<ZoomControlProps> = ({
  options,
  onChange,
}) => {
  const [open, setOpen] = useState(false);

  const { zoom } = useViewport();

  return (
    <Dropdown
      isOpen={open}
      onChange={setOpen}
      trigger={(
        <Styled.Trigger type="button" onClick={() => setOpen((prev) => !prev)}>
          {Math.round(zoom * 100)}%
        </Styled.Trigger>
      )}
      style={{ left: "auto", right: 0 }}
    >
      <Menu
        items={options}
        onCommand={(id) => {
          onChange(id);
          setOpen(false);
        }}
      />
    </Dropdown>
  );
};
