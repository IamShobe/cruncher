import { token } from "~components/ui/system";

// Utility to highlight search term in a string
export function highlightText(text: string, searchTerm?: string) {
  if (!searchTerm) return text;
  const regex = new RegExp(
    `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        style={{
          background: token("colors.highlight.mark"),
          color: token("colors.highlight.markText"),
          padding: 0,
        }}
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
