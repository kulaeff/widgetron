import type { FC } from "react";
import { Button } from "../../components/Button";

export interface CreatePageButtonProps {
  onClick: () => void;
}

export const CreatePageButton: FC<CreatePageButtonProps> = ({ onClick }) => {
  return (
    <Button
      label="Новый экран"
      size="sm"
      variant="secondary"
      onClick={onClick}
    />
  );
};
