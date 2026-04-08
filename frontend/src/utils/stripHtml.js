/**
 * Strip HTML tags from a string and return plain text.
 * Useful for card descriptions where you only want a preview.
 */
export function stripHtml(html) {
  if (!html) return "";
  // Use a temp div to decode HTML entities and strip tags
  if (typeof document !== "undefined") {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }
  // Fallback: regex strip
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
}
