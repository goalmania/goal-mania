"use client";

import React, { useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  initialValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialValue = "",
  onChange,
  placeholder = "Write your content here...",
}) => {
  const [content, setContent] = useState(initialValue);

  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange(newContent);
  };

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    const selection = window.getSelection();
    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);
      const div = document.getElementById("editor");
      if (div && div.innerHTML) {
        setContent(div.innerHTML);
        onChange(div.innerHTML);
      }
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
        <Button
          type="button"
          onClick={() => handleFormat("bold")}
          variant="ghost"
          size="sm"
          title="Bold"
        >
          <Bold size={18} />
        </Button>
        <Button
          type="button"
          onClick={() => handleFormat("italic")}
          variant="ghost"
          size="sm"
          title="Italic"
        >
          <Italic size={18} />
        </Button>
        <Button
          type="button"
          onClick={() => handleFormat("underline")}
          variant="ghost"
          size="sm"
          title="Underline"
        >
          <Underline size={18} />
        </Button>
        <span className="mx-1 w-px h-6 bg-gray-300"></span>
        <Button
          type="button"
          onClick={() => handleFormat("insertUnorderedList")}
          variant="ghost"
          size="sm"
          title="Bullet List"
        >
          <List size={18} />
        </Button>
        <Button
          type="button"
          onClick={() => handleFormat("insertOrderedList")}
          variant="ghost"
          size="sm"
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </Button>
        <span className="mx-1 w-px h-6 bg-gray-300"></span>
        <Button
          type="button"
          onClick={() => {
            const url = prompt("Enter URL");
            if (url) handleFormat("createLink", url);
          }}
          variant="ghost"
          size="sm"
          title="Insert Link"
        >
          <LinkIcon size={18} />
        </Button>
        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter image URL");
            if (url) handleFormat("insertImage", url);
          }}
          className="p-1.5 rounded hover:bg-gray-200"
          title="Insert Image"
        >
          <Image size={18} />
        </button>
        <span className="mx-1 w-px h-6 bg-gray-300"></span>
        <button
          type="button"
          onClick={() => handleFormat("justifyLeft")}
          className="p-1.5 rounded hover:bg-gray-200"
          title="Align Left"
        >
          <AlignLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => handleFormat("justifyCenter")}
          className="p-1.5 rounded hover:bg-gray-200"
          title="Align Center"
        >
          <AlignCenter size={18} />
        </button>
        <button
          type="button"
          onClick={() => handleFormat("justifyRight")}
          className="p-1.5 rounded hover:bg-gray-200"
          title="Align Right"
        >
          <AlignRight size={18} />
        </button>
      </div>

      <div className="relative">
        <div
          id="editor"
          contentEditable
          className="min-h-[200px] max-h-[600px] p-3 overflow-y-auto focus:outline-none"
          dangerouslySetInnerHTML={{ __html: content }}
          onInput={(e) => {
            const target = e.target as HTMLDivElement;
            setContent(target.innerHTML);
            onChange(target.innerHTML);
          }}
        ></div>
        <textarea
          className="hidden"
          name="content"
          value={content}
          onChange={handleChange}
        />
        {!content && (
          <div className="absolute top-3 left-3 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
