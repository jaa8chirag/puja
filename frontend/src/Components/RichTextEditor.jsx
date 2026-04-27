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
          overflow: hidden;
        }
        .ql-toolbar {
          background: rgba(255, 255, 255, 0.02);
          border: none !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        .ql-container {
          border: none !important;
          min-height: 300px;
          font-size: 14px;
        }
        .ql-editor {
          color: #e5e7eb;
          min-height: 300px;
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
