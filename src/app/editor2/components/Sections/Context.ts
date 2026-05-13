import { createContext } from "react";
import type { Size } from "./types";

interface SectionsContextProps {
  setSize: (size: Size) => void;
}

export const SectionsContext = createContext<SectionsContextProps>(
  {} as SectionsContextProps
);
