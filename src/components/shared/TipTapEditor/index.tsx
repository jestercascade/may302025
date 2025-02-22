"use client";

import styles from "./styles.module.css";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import ImageResize from "tiptap-extension-resize-image";
import TextAlign from "@tiptap/extension-text-align";
import Strike from "@tiptap/extension-strike";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Link2,
  Image as ImageIcon,
  Type,
  ListOrdered,
  List,
} from "lucide-react";
import clsx from "clsx";

export const EDITOR_LEVELS = {
  BASIC: "BASIC",
  STANDARD: "STANDARD",
  FULL: "FULL",
} as const;

export const TOOLBAR_FEATURES = {
  TEXT_FORMAT: "TEXT_FORMAT",
  HEADINGS: "HEADINGS",
  ALIGN: "ALIGN",
  LISTS: "LISTS",
  LINK: "LINK",
  IMAGE: "IMAGE",
  HISTORY: "HISTORY",
} as const;

const LEVEL_CONFIGURATIONS = {
  [EDITOR_LEVELS.BASIC]: [
    TOOLBAR_FEATURES.TEXT_FORMAT,
    TOOLBAR_FEATURES.HISTORY,
  ],
  [EDITOR_LEVELS.STANDARD]: [
    TOOLBAR_FEATURES.TEXT_FORMAT,
    TOOLBAR_FEATURES.HEADINGS,
    TOOLBAR_FEATURES.LISTS,
    TOOLBAR_FEATURES.LINK,
    TOOLBAR_FEATURES.HISTORY,
  ],
  [EDITOR_LEVELS.FULL]: [
    TOOLBAR_FEATURES.TEXT_FORMAT,
    TOOLBAR_FEATURES.HEADINGS,
    TOOLBAR_FEATURES.ALIGN,
    TOOLBAR_FEATURES.LISTS,
    TOOLBAR_FEATURES.LINK,
    TOOLBAR_FEATURES.IMAGE,
    TOOLBAR_FEATURES.HISTORY,
  ],
};

interface TipTapEditorProps {
  level?: keyof typeof EDITOR_LEVELS;
  customFeatures?: (keyof typeof TOOLBAR_FEATURES)[];
  initialContent?: string;
  onUpdate?: (html: string) => void;
}

/**
 * TipTapEditor is a rich text editor component built on top of TipTap with configurable features.
 * It supports different levels of functionality and custom feature sets.
 *
 * @component
 *
 * @example
 * // Basic usage with default settings (BASIC level)
 * <TipTapEditor />
 *
 * @example
 * // Using STANDARD level with default features
 * <TipTapEditor level="STANDARD" />
 *
 * @example
 * // Using FULL level with all available features
 * <TipTapEditor level="FULL" />
 *
 * @example
 * // Custom feature set
 * <TipTapEditor
 *   customFeatures={[
 *     "TEXT_FORMAT",
 *     "HEADINGS",
 *     "LISTS"
 *   ]}
 * />
 *
 * @example
 * // With initial content and update handler
 * <TipTapEditor
 *   level="FULL"
 *   initialContent="<h1>Welcome</h1><p>Start editing...</p>"
 *   onUpdate={(html) => console.log('Content updated:', html)}
 * />
 *
 * Feature Sets by Level:
 * - BASIC: TEXT_FORMAT, HISTORY
 * - STANDARD: TEXT_FORMAT, HEADINGS, LISTS, LINK, HISTORY
 * - FULL: TEXT_FORMAT, HEADINGS, ALIGN, LISTS, LINK, IMAGE, HISTORY
 *
 * Available Features:
 * - TEXT_FORMAT: Bold, Italic, Strikethrough, Underline
 * - HEADINGS: Normal text, H1, H2
 * - ALIGN: Left, Center, Right alignment
 * - LISTS: Bullet and ordered lists
 * - LINK: Add/edit links
 * - IMAGE: Insert images from URL
 * - HISTORY: Undo/Redo
 *
 * @param {Object} props - Component props
 * @param {("BASIC"|"STANDARD"|"FULL")} [props.level="BASIC"] - Predefined feature level
 * @param {Array<string>} [props.customFeatures] - Custom set of features to enable
 * @param {string} [props.initialContent="<div>Start typing...</div>"] - Initial HTML content
 * @param {(html: string) => void} [props.onUpdate] - Callback fired when content changes
 *
 * @example
 * // TypeScript type definitions for customFeatures
 * type ToolbarFeature =
 *   | "TEXT_FORMAT"
 *   | "HEADINGS"
 *   | "ALIGN"
 *   | "LISTS"
 *   | "LINK"
 *   | "IMAGE"
 *   | "HISTORY";
 *
 * @example
 * // Using all props with TypeScript
 * import { EDITOR_LEVELS, TOOLBAR_FEATURES } from './TipTapEditor';
 *
 * <TipTapEditor
 *   level={EDITOR_LEVELS.FULL}
 *   customFeatures={[
 *     TOOLBAR_FEATURES.TEXT_FORMAT,
 *     TOOLBAR_FEATURES.HEADINGS,
 *     TOOLBAR_FEATURES.LISTS
 *   ]}
 *   initialContent="<h1>Hello World</h1>"
 *   onUpdate={(html) => saveContent(html)}
 * />
 *
 * @example
 * // Using in a form
 * const MyForm = () => {
 *   const [content, setContent] = useState('');
 *
 *   const handleSubmit = (e) => {
 *     e.preventDefault();
 *     console.log('Submitting content:', content);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <TipTapEditor
 *         level="STANDARD"
 *         onUpdate={setContent}
 *       />
 *       <button type="submit">Save</button>
 *     </form>
 *   );
 * };
 */
export default function TipTapEditor({
  level = EDITOR_LEVELS.BASIC,
  customFeatures,
  initialContent = "<div>Start typing...</div>",
  onUpdate,
}: TipTapEditorProps) {
  const activeFeatures = customFeatures || LEVEL_CONFIGURATIONS[level];

  const getExtensions = () => {
    const extensions: any[] = [
      StarterKit.configure({
        strike: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ];

    if (activeFeatures.includes(TOOLBAR_FEATURES.TEXT_FORMAT)) {
      extensions.push(Strike.configure({}), Underline.configure({}));
    }

    if (activeFeatures.includes(TOOLBAR_FEATURES.IMAGE)) {
      extensions.push(
        Image.configure({
          HTMLAttributes: {
            class: "max-w-full rounded-lg border border-gray-200",
          },
        }),
        ImageResize
      );
    }

    if (activeFeatures.includes(TOOLBAR_FEATURES.LINK)) {
      extensions.push(
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-blue-600 hover:text-blue-800 transition-colors",
          },
        })
      );
    }

    return extensions;
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: getExtensions(),
    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
    },
  });

  const getToolbarItems = () => {
    const items = [];

    if (activeFeatures.includes(TOOLBAR_FEATURES.HISTORY)) {
      items.push([
        {
          icon: Undo2,
          label: "Undo",
          action: () => editor?.chain().focus().undo().run(),
        },
        {
          icon: Redo2,
          label: "Redo",
          action: () => editor?.chain().focus().redo().run(),
        },
      ]);
    }

    if (activeFeatures.includes(TOOLBAR_FEATURES.HEADINGS)) {
      items.push([
        {
          icon: Type,
          label: "Normal text",
          action: () => editor?.chain().focus().setParagraph().run(),
          isActive: () => editor?.isActive("paragraph") ?? false,
        },
        {
          icon: Heading1,
          label: "Heading 1",
          action: () =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run(),
          isActive: () => editor?.isActive("heading", { level: 1 }) ?? false,
        },
        {
          icon: Heading2,
          label: "Heading 2",
          action: () =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: () => editor?.isActive("heading", { level: 2 }) ?? false,
        },
      ]);
    }

    if (activeFeatures.includes(TOOLBAR_FEATURES.TEXT_FORMAT)) {
      items.push([
        {
          icon: Bold,
          label: "Bold",
          action: () => editor?.chain().focus().toggleBold().run(),
          isActive: () => editor?.isActive("bold") ?? false,
        },
        {
          icon: Italic,
          label: "Italic",
          action: () => editor?.chain().focus().toggleItalic().run(),
          isActive: () => editor?.isActive("italic") ?? false,
        },
        {
          icon: Strikethrough,
          label: "Strikethrough",
          action: () => editor?.chain().focus().toggleStrike().run(),
          isActive: () => editor?.isActive("strike") ?? false,
        },
        {
          icon: UnderlineIcon,
          label: "Underline",
          action: () => editor?.chain().focus().toggleUnderline().run(),
          isActive: () => editor?.isActive("underline") ?? false,
        },
      ]);
    }

    if (activeFeatures.includes(TOOLBAR_FEATURES.ALIGN)) {
      items.push([
        {
          icon: AlignLeft,
          label: "Align left",
          action: () => editor?.chain().focus().setTextAlign("left").run(),
          isActive: () => editor?.isActive({ textAlign: "left" }) ?? false,
        },
        {
          icon: AlignCenter,
          label: "Align center",
          action: () => editor?.chain().focus().setTextAlign("center").run(),
          isActive: () => editor?.isActive({ textAlign: "center" }) ?? false,
        },
        {
          icon: AlignRight,
          label: "Align right",
          action: () => editor?.chain().focus().setTextAlign("right").run(),
          isActive: () => editor?.isActive({ textAlign: "right" }) ?? false,
        },
      ]);
    }

    if (activeFeatures.includes(TOOLBAR_FEATURES.LISTS)) {
      items.push([
        {
          icon: List,
          label: "Bullet list",
          action: () => editor?.chain().focus().toggleBulletList().run(),
          isActive: () => editor?.isActive("bulletList") ?? false,
        },
        {
          icon: ListOrdered,
          label: "Ordered list",
          action: () => editor?.chain().focus().toggleOrderedList().run(),
          isActive: () => editor?.isActive("orderedList") ?? false,
        },
      ]);
    }

    if (activeFeatures.includes(TOOLBAR_FEATURES.LINK)) {
      items.push([
        {
          icon: Link2,
          label: "Add link",
          action: () => {
            if (editor?.isActive("link")) {
              // If the selected text is already a link, unlink it
              editor.chain().focus().unsetLink().run();
            } else {
              // Get the selected text
              const selectedText = editor?.state.selection.empty
                ? ""
                : editor?.view.state.doc.textBetween(
                    editor.state.selection.from,
                    editor.state.selection.to
                  );

              if (!selectedText) {
                window.alert("Please select some text first");
                return;
              }

              const input = window.prompt("Enter URL", "https://");
              if (input === null) return; // User cancelled

              const normalizedUrl = normalizeUrl(input);

              if (normalizedUrl) {
                editor?.chain().focus().setLink({ href: normalizedUrl }).run();
              } else {
                window.alert(
                  "Please enter a valid URL (e.g., https://example.com)"
                );
              }
            }
          },
          isActive: () => editor?.isActive("link") ?? false,
        },
      ]);
    }

    if (activeFeatures.includes(TOOLBAR_FEATURES.IMAGE)) {
      items.push([
        {
          icon: ImageIcon,
          label: "Add image",
          action: () => {
            const url = window.prompt("Enter image URL");
            if (url) {
              editor?.chain().focus().setImage({ src: url }).run();
            }
          },
        },
      ]);
    }

    return items;
  };

  return (
    <div className="w-full mx-auto">
      <div
        className={`sticky top-0 z-50 border-b bg-neutral-50 rounded-t-md overflow-x-auto ${styles.customScrollbar}`}
      >
        <div className="flex flex-wrap gap-1 py-1 w-max">
          {getToolbarItems().map((group, index) => (
            <ToolbarGroup key={index}>
              {group.map((item) => (
                <ToolbarButton key={item.label} {...item} />
              ))}
            </ToolbarGroup>
          ))}
        </div>
      </div>
      <div className="rounded-b-md">
        <EditorContent editor={editor} className="px-8 py-6 min-h-32" />
      </div>
    </div>
  );
}

interface ToolbarButtonProps {
  icon: any;
  label: string;
  action: () => void;
  isActive?: () => boolean;
}

function ToolbarButton({
  icon: Icon,
  label,
  action,
  isActive,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={action}
      title={label}
      className={clsx(
        "p-1.5 rounded-md hover:bg-[#eaeaea] transition-colors",
        isActive?.() && "bg-[#eaeaea] text-blue-600"
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-0.5 px-1 border-r border-gray-200 last:border-0">
      {children}
    </div>
  );
}

function normalizeUrl(url: string): string | null {
  try {
    url = url.trim();

    if (!url) return null;

    // Check if it's just a domain-like string (e.g., "google.com")
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (domainRegex.test(url)) {
      url = `https://${url}`;
    }

    const urlObj = new URL(url);

    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return null;
    }

    // Return the normalized URL string
    return urlObj.toString();
  } catch {
    return null;
  }
}
