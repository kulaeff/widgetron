import { useEffect, useState } from "react";
import { createHighlighter, type Highlighter } from "shiki";
import * as Styled from "./styled";

// Preload highlighter on module load
let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["min-light", "min-dark"],
      langs: ["json"],
    });
  }
  return highlighterPromise;
}

// Start loading immediately when module is imported
if (typeof window !== "undefined") {
  getHighlighter();
}

interface CodeBlockProps {
  code: string;
  lang: "json" | "tsx" | "typescript";
  fillHeight?: boolean;
}

export function CodeBlock({ code, lang, fillHeight }: CodeBlockProps) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    getHighlighter().then((highlighter) => {
      setHtml(
        highlighter.codeToHtml(code, {
          lang,
          themes: {
            light: "min-light",
            dark: "min-dark",
          },
          defaultColor: false,
        })
      );
    });
  }, [code, lang]);

  if (!html) {
    return fillHeight ? <div className="p-3" /> : null;
  }

  return (
    <Styled.Container>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </Styled.Container>
  );
}
