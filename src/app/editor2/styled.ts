import styled, { css } from "styled-components";

export const Container = styled("div")({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  overflow: "hidden",
});

export const Workspace = styled("div")`
  height: 100%;
  overflow: hidden;
  position: relative;
`;

export const ModeSwitch = styled("div")(
  ({ theme }) => css`
    ${theme.typography.body2Regular}
    align-items: center;
    color: ${theme.tokens.current.core.text.secondary};
    display: inline-flex;
    gap: 8px;
  `
);

export const ModeLabel = styled("span")<{ $active?: boolean }>(
  ({ $active, theme }) => css`
    color: ${$active
      ? theme.tokens.current.core.text.primary
      : theme.tokens.current.core.text.secondary};
    transition: color 0.15s ease;
  `
);

export const Placeholder = styled.div(
  ({ theme }) => css`
    ${theme.typography.body2Regular}
    align-content: center;
    color: ${theme.tokens.current.core.text.secondary};
    box-sizing: border-box;
    height: 100%;
    padding: 16px;
    text-align: center;
  `
);

export const Preview = styled("div")`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  height: 100%;
  justify-content: center;
  overflow: auto;
`;

export const Tabs = styled("div")`
  overflow-x: auto;
  padding: 8px;
  white-space: nowrap;
`;

export const ComponentPickerSurface = styled("div")`
  height: 100%;
  min-height: 0;
  overflow: hidden;
`;

export const SaveDock = styled("div")`
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #d1d5db;
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.1);
  display: inline-flex;
  margin-right: 236px;
  padding: 5px;
`;

export const ModeDock = styled("div")`
  display: inline-flex;
`;

export const ViewportDock = styled("div")`
  display: inline-flex;
`;

export const SaveButton = styled("button")(
  ({ theme }) => css`
    ${theme.typography.body1Semibold};
    align-items: center;
    background: transparent;
    border: none;
    border-radius: 14px;
    color: ${theme.tokens.current.core.text.primary};
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    min-height: 32px;
    letter-spacing: 0;
    padding: 0 18px;
    transition:
      transform 0.15s ease,
      background-color 0.15s ease;

    &:hover:not(:disabled) {
      background-color: ${theme.tokens.current.core.layer["01"]};
      transform: translateY(-1px);
    }

    &:disabled {
      color: ${theme.tokens.current.core.text.secondary};
      cursor: not-allowed;
      opacity: 0.8;
    }
  `
);

export const AIRail = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 18px;
  height: 100%;
  width: min(360px, calc(100% - 32px));
`;

export const RailCard = styled("section")<{ $withAccent?: boolean }>(
  ({ $withAccent = true, theme }) => css`
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.94));
    border: 1px solid ${theme.tokens.current.core.border.strong};
    border-radius: 18px;
    box-shadow: 0 20px 44px rgba(15, 23, 42, 0.14);
    overflow: hidden;
    position: relative;

    &::before {
      background:
        linear-gradient(
          90deg,
          rgba(17, 190, 168, 0.12) 0%,
          rgba(42, 124, 240, 0.62) 48%,
          rgba(123, 92, 255, 0.16) 100%
        );
      content: "";
      display: ${$withAccent ? "block" : "none"};
      height: 3px;
      left: 18px;
      position: absolute;
      right: 18px;
      top: 0;
    }
  `
);

export const RailCardBody = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  padding: 18px;
`;

export const RailHeader = styled("div")`
  align-items: flex-start;
  display: flex;
  gap: 10px;
  justify-content: space-between;
`;

export const RailTitle = styled("div")`
  ${({ theme }) => theme.typography.captionRegular};
  color: ${({ theme }) => theme.tokens.current.core.text.secondary};
  letter-spacing: 0.02em;
  text-transform: uppercase;
`;

export const RailMeta = styled("div")`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const RailTag = styled("span")<{
  $tone?: "accent" | "default" | "success";
}>(
  ({ $tone = "default", theme }) => {
    const styles = {
      accent: {
        background: "rgba(42, 124, 240, 0.12)",
        border: "rgba(42, 124, 240, 0.18)",
        color: theme.tokens.current.colors.blue.solid[60],
      },
      default: {
        background: theme.tokens.current.core.layer["01"],
        border: theme.tokens.current.core.border.strong,
        color: theme.tokens.current.core.text.secondary,
      },
      success: {
        background: "rgba(17, 190, 168, 0.12)",
        border: "rgba(17, 190, 168, 0.18)",
        color: theme.tokens.current.colors.green.solid[60],
      },
    }[$tone];

    return css`
      ${theme.typography.captionRegular};
      align-items: center;
      background: ${styles.background};
      border: 1px solid ${styles.border};
      border-radius: 999px;
      color: ${styles.color};
      display: inline-flex;
      min-height: 24px;
      padding: 0 10px;
      white-space: nowrap;
    `;
  }
);

export const PromptPreview = styled("div")`
  ${({ theme }) => theme.typography.body1Regular};
  color: ${({ theme }) => theme.tokens.current.core.text.primary};
  line-height: 1.55;
  max-height: 180px;
  min-height: 72px;
  overflow: auto;
  padding-right: 4px;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const ComposerShell = styled("div")(
  ({ theme }) => css`
    background: ${theme.tokens.current.core.layer["01"]};
    border: 1px solid ${theme.tokens.current.core.border.strong};
    border-radius: 14px;
    padding: 12px;
  `
);

export const HistoryDock = styled("div")`
  margin-top: auto;
  min-height: 0;
`;

export const HistoryCard = styled(RailCard)`
  display: flex;
  flex-direction: column;
`;

export const HistoryCardBody = styled(RailCardBody)`
  height: 100%;
  gap: 10px;
  padding: 14px 16px;
`;

export const HistoryList = styled("div")`
  min-height: 0;
  overflow: hidden;
`;

export const HistoryTrigger = styled("button")(
  ({ theme }) => css`
    ${theme.typography.body2Regular};
    align-items: center;
    background: transparent;
    border: none;
    color: ${theme.tokens.current.core.text.primary};
    cursor: pointer;
    display: grid;
    gap: 12px;
    grid-template-columns: 1fr auto;
    padding: 0;
    text-align: left;
    width: 100%;
  `
);

export const HistoryHeading = styled("div")`
  ${({ theme }) => theme.typography.body1Semibold};
  color: ${({ theme }) => theme.tokens.current.core.text.secondary};
  white-space: nowrap;
`;

export const HistoryTriggerMain = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

export const HistoryTriggerValue = styled("div")`
  ${({ theme }) => theme.typography.body2Regular};
  color: ${({ theme }) => theme.tokens.current.core.text.primary};
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-height: 1.35;
  white-space: normal;
`;

export const BottomComposer = styled("div")`
  min-width: 420px;
  width: 100%;
  max-width: 760px;
`;

export const HistoryArrow = styled("span")<{ $open: boolean }>`
  align-items: center;
  color: ${({ theme }) => theme.tokens.current.core.text.secondary};
  display: inline-flex;
  justify-content: center;
  transform: rotate(${({ $open }) => ($open ? "180deg" : "0deg")});
  transition: transform 0.16s ease;
`;

export const CodePanel = styled("div")`
  height: 100%;
  min-height: 0;
  position: relative;
`;

export const CodeExpandButton = styled("button")`
  align-items: center;
  background: ${({ theme }) => theme.tokens.current.core.background.default};
  border: 1px solid ${({ theme }) => theme.tokens.current.core.border.strong};
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  color: ${({ theme }) => theme.tokens.current.core.text.secondary};
  cursor: pointer;
  display: flex;
  font: inherit;
  height: 32px;
  justify-content: center;
  line-height: 1;
  padding: 0;
  position: absolute;
  right: 28px;
  top: 8px;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
  width: 32px;
  z-index: 2;

  &:hover {
    background: ${({ theme }) => theme.tokens.current.core.layer["01"]};
    border-color: ${({ theme }) => theme.tokens.current.colors.blue.solid[30]};
    color: ${({ theme }) => theme.tokens.current.core.text.primary};
  }
`;

export const CodeModalBackdrop = styled("div")`
  align-items: center;
  background: rgba(15, 23, 42, 0.28);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 24px;
  position: fixed;
  z-index: 40;
`;

export const CodeModal = styled("div")`
  background: ${({ theme }) => theme.tokens.current.core.background.default};
  border: 1px solid ${({ theme }) => theme.tokens.current.core.border.strong};
  border-radius: 8px;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.24);
  display: grid;
  grid-template-rows: auto 1fr;
  height: min(760px, calc(100% - 48px));
  max-width: 1120px;
  min-height: 0;
  overflow: hidden;
  width: min(1120px, calc(100% - 48px));
`;

export const CodeModalHeader = styled("div")`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.tokens.current.core.border.strong};
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
`;

export const CodeModalTitle = styled("div")`
  ${({ theme }) => theme.typography.body1Semibold};
  color: ${({ theme }) => theme.tokens.current.core.text.primary};
`;

export const CodeModalBody = styled("div")`
  min-height: 0;
`;

export const ApiForm = styled("div")(
  ({ theme }) => css`
    ${theme.typography.body2Regular};
    color: ${theme.tokens.current.core.text.primary};
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    overflow: auto;
    padding: 8px 0;

    label {
      color: ${theme.tokens.current.core.text.secondary};
      display: block;
      margin-bottom: 4px;
    }

    input,
    select,
    textarea {
      ${theme.typography.body2Regular};
      background: ${theme.tokens.current.core.layer["01"]};
      border: 1px solid transparent;
      border-radius: 6px;
      color: ${theme.tokens.current.core.text.primary};
      display: block;
      min-height: 32px;
      outline: none;
      padding: 6px 8px;
      transition:
        background-color 0.15s ease,
        border-color 0.15s ease,
        box-shadow 0.15s ease;
      width: 100%;
    }

    textarea {
      min-height: 112px;
      resize: vertical;
    }

    input:focus,
    select:focus,
    textarea:focus {
      background: ${theme.tokens.current.core.background.default};
      border-color: ${theme.tokens.current.colors.blue.solid[60]};
      box-shadow: 0 0 0 2px ${theme.tokens.current.colors.blue.solid[10]};
    }

    button {
      align-self: flex-start;
    }
  `
);

export const DragOverlayItem = styled("div")(
  ({ theme }) => css`
    ${theme.typography.body2Regular}
    align-items: center;
    background-color: ${theme.tokens.current.core.background.default};
    border: 1px solid ${theme.tokens.current.core.border.strong};
    border-radius: 6px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
    color: ${theme.tokens.current.core.text.primary};
    cursor: grabbing;
    display: inline-flex;
    padding: 8px 10px;
    user-select: none;
    white-space: nowrap;
  `
);
