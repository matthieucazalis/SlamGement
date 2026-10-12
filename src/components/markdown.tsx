import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h1: ({ children }) => (
    <h3 className="mt-4 text-xl font-semibold">{children}</h3>
  ),
  h2: ({ children }) => (
    <h4 className="mt-4 text-lg font-semibold">{children}</h4>
  ),
  h3: ({ children }) => <h5 className="mt-3 font-semibold">{children}</h5>,
  p: ({ children }) => <p className="leading-relaxed">{children}</p>,
  ul: ({ children }) => (
    <ul className="list-disc space-y-1 pl-6">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-1 pl-6">{children}</ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 pl-4 italic">{children}</blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline"
    >
      {children}
    </a>
  ),
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-md border bg-muted p-3 text-sm">
      {children}
    </pre>
  ),
  code: ({ className, children }) => (
    <code className={className ?? "rounded bg-muted px-1 py-0.5 text-sm"}>
      {children}
    </code>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border bg-muted px-3 py-1.5 text-left">{children}</th>
  ),
  td: ({ children }) => <td className="border px-3 py-1.5">{children}</td>,
  img: () => null,
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-3">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
