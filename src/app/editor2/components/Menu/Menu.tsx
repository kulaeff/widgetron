import { useCallback, type FC } from "react";
import * as Styled from "./styled";
import type { MenuProps } from "./types";

export const Menu: FC<MenuProps> = (props) => {
  const {
    items = [],
    onCommand,
    ...rest
  } = props;

  const handleButtonClick = useCallback((id: string) => {
    onCommand?.(id);
  }, [ onCommand ]);

  return (
    <Styled.Menu
      {...rest}
      role="menu"
    >
      {
        items.map((item) => (
          <Styled.MenuItem
            key={item.id}
            role="menuitem"
          >
            <Styled.MenuButton
              // @ts-expect-error Not typed yet
              popovertarget={item.popoverTarget}
              disabled={item.disabled}
              type="button"
              onClick={() => handleButtonClick(item.id)}
            >
              {item.label}
            </Styled.MenuButton>
          </Styled.MenuItem>
        ))
      }
    </Styled.Menu>
  );
};

export default Menu;
