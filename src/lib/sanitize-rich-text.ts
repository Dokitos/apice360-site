import sanitizeHtml from "sanitize-html";

// TipTap's StarterKit + Image/Color/TextStyle extensions (used by
// RichTextEditor) only ever emit this tag/attribute set. Uses sanitize-html
// (pure JS) instead of isomorphic-dompurify: the latter wraps jsdom, whose
// dynamic requires aren't reliably traced by Vercel's serverless bundler and
// crash the whole route at import time in production.
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "hr", "strong", "b", "em", "i", "s", "u", "code", "pre",
      "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote", "a", "img", "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
      span: ["style"],
    },
    allowedStyles: {
      // TipTap's Color extension writes rgb(...), not the hex it was given.
      span: { color: [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/] },
    },
  });
}
