import type { DefaultTheme } from "styled-components";

export const theme: DefaultTheme = {
  colors: {
    text: "#111827",
    background: "#f9fafb",
    surface: "#ffffff",
    border: "#e5e7eb",
    accent: "#2563eb"
  },
  typography: {
    body1Regular: { fontSize: "14px", fontWeight: 400, lineHeight: "20px" },
    body1Semibold: { fontSize: "14px", fontWeight: 600, lineHeight: "20px" },
    body2Regular: { fontSize: "13px", fontWeight: 400, lineHeight: "18px" },
    body2Semibold: { fontSize: "13px", fontWeight: 600, lineHeight: "18px" },
    captionRegular: { fontSize: "12px", fontWeight: 400, lineHeight: "16px" },
    captionSemibold: { fontSize: "12px", fontWeight: 600, lineHeight: "16px" },
    extraBodyRegular: { fontSize: "15px", fontWeight: 400, lineHeight: "22px" },
    smallTextRegular: { fontSize: "11px", fontWeight: 400, lineHeight: "14px" },
    smallTextSemibold: { fontSize: "11px", fontWeight: 600, lineHeight: "14px" }
  },
  tokens: {
    current: {
      core: {
        text: {
          primary: "#111827",
          secondary: "#6b7280",
          onColor: "#ffffff"
        },
        border: {
          strong: "#d1d5db"
        },
        background: {
          default: "#ffffff"
        },
        layer: {
          "01": "#f3f4f6"
        },
        accent: {
          secondary: "#dbeafe"
        }
      },
      interactive: {
        hover: {
          tertiary: "#f3f4f6"
        }
      },
      system: {
        "20": "#e5e7eb",
        "30": "#d1d5db"
      },
      colors: {
        blue: {
          solid: {
            10: "#dbeafe",
            20: "#bfdbfe",
            30: "#93c5fd",
            60: "#2563eb"
          }
        },
        green: {
          solid: {
            60: "#16a34a"
          }
        },
        orange: {
          solid: {
            60: "#ea580c"
          }
        }
      }
    }
  }
};
