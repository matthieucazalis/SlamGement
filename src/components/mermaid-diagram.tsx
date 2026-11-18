"use client";

import { Component, useEffect, useId, useState, type ReactNode } from "react";
import { useT, useTheme } from "@/i18n/client";
import { isAcceptableMermaid } from "@/lib/mermaid-check";

// Dernier filet de sécurité : quoi qu'il arrive dans le rendu du schéma, la
// page reste utilisable et affiche un simple message.
class DiagramBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

// Mermaid laisse parfois des éléments d'erreur orphelins dans <body>
function cleanupMermaidLeftovers(id: string) {
  document.getElementById(id)?.remove();
  document.getElementById(`d${id}`)?.remove();
}

function Diagram({ code }: { code: string }) {
  const t = useT();
  const theme = useTheme();
  const rawId = useId();
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const id = `mermaid-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

    // Un texte qui n'est pas un schéma n'est même pas envoyé à Mermaid
    if (!isAcceptableMermaid(code)) {
      setSvg("");
      setError(t("validation.mermaidInvalid"));
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        // le schéma suit le thème réellement affiché
        const dark = document.documentElement.classList.contains("dark");
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: dark ? "dark" : "neutral",
        });
        await mermaid.parse(code); // lève une erreur sans toucher au DOM
        const result = await mermaid.render(id, code);
        if (!cancelled) {
          setSvg(result.svg);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setSvg("");
          setError(t("validation.mermaidInvalid"));
        }
      } finally {
        cleanupMermaidLeftovers(id);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code, rawId, theme, t]);

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        {error}
      </p>
    );
  }

  return (
    <div
      className="overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function MermaidDiagram({ code }: { code: string }) {
  const t = useT();
  return (
    <DiagramBoundary
      key={code}
      fallback={
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {t("validation.mermaidInvalid")}
        </p>
      }
    >
      <Diagram code={code} />
    </DiagramBoundary>
  );
}
