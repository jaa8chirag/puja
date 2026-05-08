import React from "react";
import "./quill-content.css";

const HTMLContent = ({ content, className, style }) => {
  if (!content) return null;

  // Clean content function to prevent weird spacing/wrapping issues
  const clean = (text) => {
    if (typeof text !== 'string') return text;
    return text
      .replace(/<br\s*\/?>/gi, ' ') // Remove <br>
      .replace(/&nbsp;/g, ' ')      // Replace non-breaking space with normal space
      .replace(/\u00A0/g, ' ')      // Unicode non-breaking space
      .replace(/\s+/g, ' ')         // Normalize multiple spaces
      .trim();
  };

  const containsHTML = /<\/?[a-z][\s\S]*>/i.test(content);

  if (containsHTML) {
    return (
      <div 
        className={`quill-content ${className || ""}`}
        style={style}
        dangerouslySetInnerHTML={{ __html: clean(content) }} 
      />
    );
  }

  return (
    <p 
      className={`quill-content ${className || ""}`}
      style={style}
    >
      {clean(content)}
    </p>
  );
};

export default HTMLContent;
