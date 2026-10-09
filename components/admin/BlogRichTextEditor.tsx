"use client";

import { useEffect, useRef } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  RemoveFormatting,
  Underline,
  Unlink,
} from "lucide-react";

type BlogRichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const toolbarButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink70 transition-colors hover:bg-blue/10 hover:text-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue";

function safeHtml(value: string) {
  const parsed = new DOMParser().parseFromString(value, "text/html");
  parsed
    .querySelectorAll("script, style, iframe, object, embed")
    .forEach((node) => node.remove());
  parsed.body.querySelectorAll("*").forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const content = attribute.value.trim().toLowerCase();
      if (name.startsWith("on")) element.removeAttribute(attribute.name);
      if (
        (name === "href" || name === "src") &&
        /^(javascript|data):/.test(content)
      ) {
        element.removeAttribute(attribute.name);
      }
    });
  });
  return parsed.body.innerHTML;
}

export default function BlogRichTextEditor({
  value,
  onChange,
}: BlogRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    const next = value ? safeHtml(value) : "";
    if (editorRef.current.innerHTML !== next)
      editorRef.current.innerHTML = next;
  }, [value]);

  const runCommand = (command: string, argument?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, argument);
    if (editorRef.current) onChange(safeHtml(editorRef.current.innerHTML));
  };

  const addLink = () => {
    const enteredUrl = window.prompt("Enter the link URL (https://...)");
    if (!enteredUrl) return;
    const url = enteredUrl.trim();
    if (!/^(https?:\/\/|mailto:|tel:|\/)/i.test(url)) {
      window.alert(
        "Enter a valid https://, mailto:, tel:, or site-relative URL.",
      );
      return;
    }
    runCommand("createLink", url);
  };

  const buttons = [
    {
      label: "Bold",
      icon: <Bold size={16} />,
      action: () => runCommand("bold"),
    },
    {
      label: "Italic",
      icon: <Italic size={16} />,
      action: () => runCommand("italic"),
    },
    {
      label: "Underline",
      icon: <Underline size={16} />,
      action: () => runCommand("underline"),
    },
    {
      label: "Heading 2",
      icon: <Heading2 size={17} />,
      action: () => runCommand("formatBlock", "h2"),
    },
    {
      label: "Heading 3",
      icon: <Heading3 size={17} />,
      action: () => runCommand("formatBlock", "h3"),
    },
    {
      label: "Bulleted list",
      icon: <List size={17} />,
      action: () => runCommand("insertUnorderedList"),
    },
    {
      label: "Numbered list",
      icon: <ListOrdered size={17} />,
      action: () => runCommand("insertOrderedList"),
    },
    { label: "Add link", icon: <LinkIcon size={16} />, action: addLink },
    {
      label: "Remove link",
      icon: <Unlink size={16} />,
      action: () => runCommand("unlink"),
    },
    {
      label: "Clear formatting",
      icon: <RemoveFormatting size={16} />,
      action: () => runCommand("removeFormat"),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white focus-within:border-blue">
      <div
        aria-label="Article formatting"
        className="flex flex-wrap items-center gap-1 border-b border-line bg-cream p-2"
      >
        {buttons.map(({ label, icon, action }, index) => (
          <span key={label} className="inline-flex items-center gap-1">
            {[3, 7].includes(index) && (
              <span className="mx-1 h-6 border-s border-line" />
            )}
            <button
              type="button"
              title={label}
              aria-label={label}
              className={toolbarButtonClass}
              onMouseDown={(event) => event.preventDefault()}
              onClick={action}
            >
              {icon}
            </button>
          </span>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Article content"
        aria-multiline="true"
        onInput={(event) => onChange(safeHtml(event.currentTarget.innerHTML))}
        className="prose prose-sm min-h-[260px] max-w-none px-4 py-3 text-[14px] leading-7 outline-none [&_a]:text-blue [&_a]:underline [&_h2]:mt-5 [&_h2]:text-xl [&_h3]:mt-4 [&_h3]:text-lg"
      />
      <p className="border-t border-line px-4 py-2 text-[11px] text-muted">
        Select text first to format it or attach a link. Use https:// for web
        links.
      </p>
    </div>
  );
}
