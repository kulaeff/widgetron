import styled, { css } from "styled-components";
import type { Wrap } from "../../ui/types";
import type { SectionsProps, Size } from "./types";

const buildGridTemplateConfig = (config: Size[]) =>
  config
    .map((size) =>
      // eslint-disable-next-line no-nested-ternary
      typeof size === "number" ? `${size}px` : size === "*" ? "1fr" : "auto"
    )
    .join(" ");

export const Section = styled.div<Wrap<SectionsProps>>`
  overflow: hidden;
  & + & {
    padding-top: 8px;
  }
`;

export const Sections = styled.div<Wrap<SectionsProps> & { $config: Size[] }>`
  display: grid;
  height: 100%;
  overflow: hidden;
  ${({ $config, $vertical, theme }) =>
    $vertical
      ? css`
          grid-template-rows: ${buildGridTemplateConfig($config)};
        `
      : css`
          grid-template-columns: ${buildGridTemplateConfig($config)};
        `}
`;
