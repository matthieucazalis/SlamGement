function initials(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

export function UserAvatar({
  name,
  src,
  size = 32,
  alt = "",
}: {
  name: string;
  src?: string | null;
  size?: number;
  alt?: string;
}) {
  const style = { width: size, height: size };
  if (src)
    return (
      <img
        src={src}
        alt={alt}
        style={style}
        className="shrink-0 rounded-full object-cover"
      />
    );
  return (
    <span
      aria-hidden={alt ? undefined : true}
      style={{ ...style, fontSize: size * 0.4 }}
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground"
    >
      {initials(name)}
    </span>
  );
}
