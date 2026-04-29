/**
 * Strip HTML tags from a string and return plain text.
 * Useful for card descriptions where you only want a preview.
 */
export function stripHtml(html) {
  if (!html) return "";
  let text = "";
  // Use a temp div to decode HTML entities and strip tags
  if (typeof document !== "undefined") {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    text = tmp.textContent || tmp.innerText || "";
  } else {
    // Fallback: regex strip
    text = html.replace(/<[^>]*>/g, "");
  }
  // Replace non-breaking spaces (\u00A0) and all other whitespace with a single space
  return text.replace(/[\s\u00A0]+/g, " ").trim();
}
