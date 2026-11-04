import { ImageResponse } from "next/og";

const ICONS: Record<string, { size: number; maskable: boolean }> = {
  "192": { size: 192, maskable: false },
  "512": { size: 512, maskable: false },
  maskable: { size: 512, maskable: true },
  apple: { size: 180, maskable: false },
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const spec = ICONS[name];
  if (!spec) return new Response("Introuvable", { status: 404 });

  const { size, maskable } = spec;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        color: "#ffffff",
        fontSize: Math.round(size * (maskable ? 0.42 : 0.58)),
        borderRadius: maskable ? 0 : Math.round(size * 0.2),
      }}
    >
      S
    </div>,
    {
      width: size,
      height: size,
      headers: { "Cache-Control": "public, max-age=86400" },
    },
  );
}
