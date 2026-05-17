import "styled-components";

declare module "styled-components" {
  type TypographyStyle = {
    fontSize: string;
    fontWeight: number;
    lineHeight: string;
    letterSpacing?: string;
  };

  export interface DefaultTheme {
    colors: {
      text: string;
      background: string;
      surface: string;
      border: string;
      accent: string;
    };
    typography: {
      body1Regular: TypographyStyle;
      body1Semibold: TypographyStyle;
      body2Regular: TypographyStyle;
      body2Semibold: TypographyStyle;
      captionRegular: TypographyStyle;
      captionSemibold: TypographyStyle;
      extraBodyRegular: TypographyStyle;
      smallTextRegular: TypographyStyle;
      smallTextSemibold: TypographyStyle;
    };
    tokens: {
      current: {
        core: {
          text: {
            primary: string;
            secondary: string;
            onColor: string;
          };
          border: {
            strong: string;
          };
          background: {
            default: string;
          };
          layer: {
            "01": string;
          };
          accent: {
            primary: string;
            secondary: string;
          };
        };
        interactive: {
          hover: {
            secondary: string;
            tertiary: string;
          };
          selected: {
            layer: string;
          };
        };
        system: {
          "20": string;
          "30": string;
        };
        colors: {
          blue: {
            solid: {
              10: string;
              20: string;
              30: string;
              60: string;
            };
          };
          green: {
            solid: {
              60: string;
            };
          };
          orange: {
            solid: {
              60: string;
            };
          };
        };
      };
    };
  }
}
