import React from "react";
import "./quill-content.css";

const HTMLContent = ({ content, className }) => {
  if (!content) return null;

  // Check if content contains HTML tags (likely from Quill)
  const containsHTML = /<\/?[a-z][\s\S]*>/i.test(content);

  if (containsHTML) {
    // Clean content: remove <br> tags and normalize whitespace
    let cleanedContent = content
      // Remove <br> tags completely or replace with space
      .replace(/<br\s*\/?>/gi, ' ')
      // Remove extra spaces
      .replace(/&nbsp;/g, ' ')
      // Normalize multiple spaces to single space
      .replace(/\s+/g, ' ')
      // Trim
      .trim();
    
    return (
      <div 
        className={`quill-content ${className || ""}`}
        dangerouslySetInnerHTML={{ __html: cleanedContent }} 
      />
    );
  }

  // Fallback for plain text
  return (
    <p 
      className={`quill-content ${className || ""}`}
    >
      {content}
    </p>
  );
};

export default HTMLContent;
