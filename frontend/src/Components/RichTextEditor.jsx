import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image',
    'color', 'background', 'align'
  ];

  return (
    <div className="rich-text-editor-container">
      <style>{`
        .quill {
          background: #161b27;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          overflow: visible !important;
        }
        .ql-toolbar {
          background: rgba(255, 255, 255, 0.02);
          border: none !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
        }
        .ql-container {
          border: none !important;
          min-height: 300px;
          font-size: 14px;
        }
        .ql-editor {
          color: #e5e7eb;
          min-height: 300px;
          line-height: 1.6;
        }
        .ql-editor.ql-blank::before {
          color: #4b5563 !important;
          font-style: normal;
        }
        .ql-snow .ql-stroke {
          stroke: #9ca3af;
        }
        .ql-snow .ql-fill {
          fill: #9ca3af;
        }
        .ql-snow .ql-picker {
          color: #9ca3af;
        }
        .ql-snow .ql-picker-options {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
          color: #fff !important;
          z-index: 1000 !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
        }
        .ql-snow .ql-tooltip {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
          color: #fff !important;
          z-index: 1001 !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
        }
        .ql-snow .ql-tooltip input[type=text] {
          background: #111827 !important;
          border: 1px solid #374151 !important;
          color: #fff !important;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Start writing..."}
      />
    </div>
  );
};

export default RichTextEditor;
