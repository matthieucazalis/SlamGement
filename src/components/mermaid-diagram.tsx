"use client";

import { useEffect, useId, useState } from "react";

export function MermaidDiagram({ code }: { code: string }) {
  const rawId = useId();
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "neutral",
        });
        const id = `mermaid-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
        const result = await mermaid.render(id, code);
        if (!cancelled) {
          setSvg(result.svg);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setSvg("");
          setError(e instanceof Error ? e.message : "Schéma invalide");
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code, rawId]);

  if (error) {
    return (
      <div role="alert" className="space-y-1 text-sm text-red-600">
        <p>Schéma invalide :</p>
        <pre className="overflow-x-auto whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
