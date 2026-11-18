import { openApiSpec } from "@/lib/openapi";

export const metadata = { title: "API" };

// Documentation générée à partir de la description OpenAPI : une seule source
// de vérité. Texte volontairement en anglais (documentation technique).
export default function ApiDocsPage() {
  type Operation = {
    summary: string;
    parameters?: readonly { name: string; in: string }[];
  };
  const operations = Object.entries(openApiSpec.paths).flatMap(([path, item]) =>
    Object.entries(item as unknown as Record<string, Operation>).map(
      ([method, op]) => ({
        method: method.toUpperCase(),
        path,
        summary: op.summary,
        params: op.parameters ?? [],
      }),
    ),
  );

  return (
    <main id="main-content" className="mx-auto max-w-3xl space-y-6 p-4 sm:p-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{openApiSpec.info.title}</h1>
        <p className="text-sm text-muted-foreground">
          {openApiSpec.info.description}
        </p>
        <p className="text-sm">
          OpenAPI document:{" "}
          <a href="/api/v1/openapi.json" className="underline">
            /api/v1/openapi.json
          </a>
        </p>
      </div>

      <ul className="space-y-3">
        {operations.map((op) => (
          <li
            key={`${op.method} ${op.path}`}
            className="space-y-1 rounded-lg border p-4"
          >
            <p className="font-mono text-sm">
              <span className="mr-2 rounded bg-muted px-2 py-0.5 font-semibold">
                {op.method}
              </span>
              /api/v1{op.path}
            </p>
            <p className="text-sm">{op.summary}</p>
            {op.params.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Parameters:{" "}
                {op.params.map((p) => `${p.name} (${p.in})`).join(", ")}
              </p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
