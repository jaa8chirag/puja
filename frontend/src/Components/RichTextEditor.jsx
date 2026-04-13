import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  return (
    <div className="rich-text-editor-container min-h-[400px]">
      <Editor
        apiKey="h1q27wshhgc1uo6vsx0g26jfegj34c4b62r35qh6fd4odq0t" // Updated with your API key
        value={value || ""}
        onEditorChange={(content) => onChange(content)}
        init={{
          height: 400,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; background: #0f172a; color: #fff; }',
          skin: 'oxide-dark',
          content_css: 'dark',
          placeholder: placeholder || "Start writing...",
          branding: false,
          promotion: false
        }}
      />
    </div>
  );
};

export default RichTextEditor;
