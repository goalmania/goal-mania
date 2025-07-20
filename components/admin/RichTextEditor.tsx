"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
      setImageUrl("");
      setShowImageDialog(false);
      toast.success("Image added successfully");
    } else {
      toast.error("Please enter a valid image URL");
    }
  };

  const uploadImageToCloudinary = async (file: File) => {
    setIsUploadingImage(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

      const response = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_URL!, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const setLink = () => {
    if (linkUrl.trim()) {
      const selectedText = editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to
      );

      if (selectedText) {
        // If there's selected text, make it a link
        editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
        toast.success("Link added to selected text");
      } else if (linkText.trim()) {
        // If no text is selected but link text is provided, insert it as a link
        editor.chain().focus().setLink({ href: linkUrl.trim() }).insertContent(linkText.trim()).run();
        toast.success("Link text inserted successfully");
      } else {
        // If no text is selected and no link text, insert the URL as link text
        editor.chain().focus().setLink({ href: linkUrl.trim() }).insertContent(linkUrl.trim()).run();
        toast.success("URL inserted as link");
      }
      
      setLinkUrl("");
      setLinkText("");
      setShowLinkDialog(false);
    } else {
      toast.error("Please enter a valid URL");
    }
  };

  const getSelectedText = () => {
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    );
    return selectedText;
  };

  const isTextSelected = () => {
    return editor.state.selection.from !== editor.state.selection.to;
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
    toast.success("Link removed");
  };

  const updateLink = () => {
    if (linkUrl.trim()) {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
      setLinkUrl("");
      setShowLinkDialog(false);
      toast.success("Link updated successfully");
    } else {
      toast.error("Please enter a valid URL");
    }
  };

  const getCurrentLink = () => {
    const { from, to } = editor.state.selection;
    const linkMark = editor.state.schema.marks.link;
    const link = linkMark.isInSet(editor.state.doc.resolve(from).marks());
    return link?.attrs?.href || "";
  };

  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  const setHighlight = (color: string) => {
    editor.chain().focus().setHighlight({ color }).run();
  };

  return (
    <div className="border-b border-gray-200 p-2 bg-gray-50 rounded-t-lg">
      <div className="flex flex-wrap gap-1">
        {/* Text Formatting */}
        <Button
          variant={editor.isActive("bold") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive("italic") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive("underline") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive("strike") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Headings */}
        <Button
          variant={editor.isActive("heading", { level: 1 }) ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive("heading", { level: 3 }) ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <Button
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive("orderedList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Alignment */}
        <Button
          variant={editor.isActive({ textAlign: "left" }) ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive({ textAlign: "center" }) ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive({ textAlign: "right" }) ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive({ textAlign: "justify" }) ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Other */}
        <Button
          variant={editor.isActive("blockquote") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive("codeBlock") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Links and Images */}
        <Button
          variant={editor.isActive("link") ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            if (editor.isActive("link")) {
              // If cursor is on a link, show dialog to update it
              const currentLink = getCurrentLink();
              if (currentLink) {
                setLinkUrl(currentLink);
                setShowLinkDialog(true);
              } else {
                removeLink();
              }
            } else {
              setShowLinkDialog(true);
            }
          }}
          title={editor.isActive("link") ? "Update Link" : "Add Link"}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowImageDialog(true)}
          title="Add Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Colors */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setColor("#000000")}
            className="w-6 h-6 p-0 bg-black hover:bg-gray-800"
            title="Black"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setColor("#dc2626")}
            className="w-6 h-6 p-0 bg-red-600 hover:bg-red-700"
            title="Red"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setColor("#2563eb")}
            className="w-6 h-6 p-0 bg-blue-600 hover:bg-blue-700"
            title="Blue"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setColor("#059669")}
            className="w-6 h-6 p-0 bg-green-600 hover:bg-green-700"
            title="Green"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setColor("#d97706")}
            className="w-6 h-6 p-0 bg-orange-600 hover:bg-orange-700"
            title="Orange"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setColor("#7c3aed")}
            className="w-6 h-6 p-0 bg-purple-600 hover:bg-purple-700"
            title="Purple"
          />
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Highlight */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHighlight("#fef3c7")}
            className="w-6 h-6 p-0 bg-yellow-200 hover:bg-yellow-300"
            title="Yellow Highlight"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHighlight("#fecaca")}
            className="w-6 h-6 p-0 bg-red-200 hover:bg-red-300"
            title="Red Highlight"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHighlight("#bfdbfe")}
            className="w-6 h-6 p-0 bg-blue-200 hover:bg-blue-300"
            title="Blue Highlight"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHighlight("#bbf7d0")}
            className="w-6 h-6 p-0 bg-green-200 hover:bg-green-300"
            title="Green Highlight"
          />
        </div>
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4">
              {editor.isActive("link") ? "Update Link" : "Add Link"}
            </h3>
            
            {/* Selected Text Display */}
            {isTextSelected() && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-800 mb-1">Selected Text:</p>
                <p className="text-sm text-blue-700 bg-white p-2 rounded border">
                  "{getSelectedText()}"
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  This text will become a clickable link
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setLink();
                    }
                  }}
                  autoFocus
                />
              </div>
              
              {!isTextSelected() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link Text (optional)
                  </label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Enter link text or leave empty to use URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setLink();
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If no text is selected, this will be inserted as a new link
                  </p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600">
                <strong>How to use:</strong>
              </p>
              <ul className="text-xs text-gray-600 mt-1 space-y-1">
                <li>• Select text first, then click "Add Link" to make it clickable</li>
                <li>• Or click "Add Link" without selection to insert a new link</li>
                <li>• Press Enter to quickly add the link</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              {editor.isActive("link") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    removeLink();
                    setShowLinkDialog(false);
                    setLinkUrl("");
                    setLinkText("");
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove Link
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl("");
                  setLinkText("");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={editor.isActive("link") ? updateLink : setLink}
                disabled={!linkUrl.trim()}
              >
                {editor.isActive("link") 
                  ? "Update Link" 
                  : (isTextSelected() ? "Make Link" : "Add Link")
                }
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4">Add Image</h3>
            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const uploadedUrl = await uploadImageToCloudinary(file);
                        if (uploadedUrl) {
                          editor.chain().focus().setImage({ src: uploadedUrl }).run();
                          setShowImageDialog(false);
                          toast.success("Image uploaded and added successfully");
                        }
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploadingImage}
                  />
                  <div className="text-center">
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                        <p className="text-sm text-gray-600">Uploading image...</p>
                      </div>
                    ) : (
                      <div>
                        <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, WebP up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addImage();
                    }
                  }}
                />
              </div>
              {imageUrl && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preview
                  </label>
                  <div className="border border-gray-300 rounded-md p-2">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="max-w-full h-32 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowImageDialog(false);
                  setImageUrl("");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={addImage}
                disabled={!imageUrl.trim()}
              >
                Add Image
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder: 'Start writing your article content...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
        style: `
          line-height: 1.6;
          font-size: 14px;
        `,
      },
    },
    immediatelyRender: false,
  });

  if (!isMounted) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 p-2 bg-gray-50 rounded-t-lg">
          <div className="flex flex-wrap gap-1">
            {/* Placeholder toolbar */}
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="p-4 min-h-[300px] bg-gray-50 animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="focus:outline-none"
        style={{
          '--tw-prose-body': '#374151',
          '--tw-prose-headings': '#111827',
          '--tw-prose-links': '#2563eb',
          '--tw-prose-bold': '#111827',
          '--tw-prose-counters': '#6b7280',
          '--tw-prose-bullets': '#d1d5db',
          '--tw-prose-hr': '#e5e7eb',
          '--tw-prose-quotes': '#111827',
          '--tw-prose-quote-borders': '#e5e7eb',
          '--tw-prose-captions': '#6b7280',
          '--tw-prose-code': '#111827',
          '--tw-prose-pre-code': '#e5e7eb',
          '--tw-prose-pre-bg': '#1f2937',
          '--tw-prose-th-borders': '#d1d5db',
          '--tw-prose-td-borders': '#e5e7eb',
        } as React.CSSProperties}
      />
    </div>
  );
}; 