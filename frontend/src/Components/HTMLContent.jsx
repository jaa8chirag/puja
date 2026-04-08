import React from "react";
import "./quill-content.css";

const HTMLContent = ({ content, className }) => {
  if (!content) return null;

  // Check if content contains HTML tags (likely from Quill)
  const containsHTML = /<\/?[a-z][\s\S]*>/i.test(content);

  if (containsHTML) {
    return (
      <div 
        className={`quill-content ${className || ""}`}
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    );
  }

  // Fallback for plain text / basic markdown-like
  return <p className={className}>{content}</p>;
};

export default HTMLContent;
