import styled, { css } from "styled-components";
import type { AvatarSize } from "./types";

const pxBySize: Record<AvatarSize, number> = {
  xs: 20,
  s: 24,
  m: 32,
  l: 40,
  xl: 48,
  xxl: 56,
};

export const Avatar = styled.div<{ $size: AvatarSize }>(({ $size }) => css`
  align-items: center;
  background: #e5e7eb;
  border-radius: 9999px;
  color: #374151;
  display: inline-flex;
  font-weight: 600;
  height: ${pxBySize[$size]}px;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: ${pxBySize[$size]}px;
`);

export const AvatarImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

export const AvatarText = styled.span<{ $size: AvatarSize }>(({ $size }) => css`
  font-size: ${Math.max(10, Math.floor(pxBySize[$size] / 3))}px;
`);

export const Badge = styled.span`
  background: #22c55e;
  border: 1px solid #ffffff;
  border-radius: 9999px;
  bottom: 0;
  height: 10px;
  position: absolute;
  right: 0;
  width: 10px;
`;

export const Label = styled.small`
  background: #111827;
  border-radius: 6px;
  bottom: -4px;
  color: #f9fafb;
  font-size: 10px;
  line-height: 1;
  padding: 2px 4px;
  position: absolute;
  right: -4px;
`;
