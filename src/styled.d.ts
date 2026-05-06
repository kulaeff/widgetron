import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      text: string;
      background: string;
      surface: string;
      border: string;
      accent: string;
    };
  }
}
