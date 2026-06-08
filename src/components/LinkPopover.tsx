'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { Link2, Check, ExternalLink } from 'lucide-react';

interface LinkPopoverProps {
  editor: Editor | null;
  open: boolean;
  onClose: () => void;
}

/** Garante protocolo válido e bloqueia esquemas perigosos como javascript: */
function sanitizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return `https://${trimmed}`;
  // Se não tem protocolo (ex: "google.com"), prepend https://
  if (!/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

export function LinkPopover({ editor, open, onClose }: LinkPopoverProps) {
  const [displayText, setDisplayText] = useState('');
  const [url, setUrl] = useState('');
  const initialDisplayTextRef = useRef('');
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !editor) return;
    const { from, to } = editor.state.selection;
    const text = from !== to ? editor.state.doc.textBetween(from, to, ' ') : '';
    setDisplayText(text);
    setUrl(editor.getAttributes('link').href ?? '');
    initialDisplayTextRef.current = text;
    setTimeout(() => urlInputRef.current?.focus(), 50);
  }, [open, editor]);

  const apply = () => {
    if (!editor) return;

    // ProseMirror preserves selection even while editor is DOM-unfocused — read it directly.
    const { from, to } = editor.state.selection;
    const trimmedUrl = sanitizeUrl(url);

    if (!trimmedUrl) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      onClose();
      return;
    }

    const hasSelection = from !== to;
    const textChanged = displayText.trim() !== initialDisplayTextRef.current.trim();

    if (!hasSelection) {
      // No selection: insert a clickable text node with the link mark applied.
      const text = displayText.trim() || trimmedUrl;
      editor
        .chain()
        .focus()
        .insertContent({ type: 'text', text, marks: [{ type: 'link', attrs: { href: trimmedUrl } }] })
        .run();
    } else if (textChanged) {
      // Selection with edited display text: replace the range with new text + link mark.
      const text = displayText.trim() || trimmedUrl;
      editor
        .chain()
        .focus()
        .setTextSelection({ from, to })
        .insertContent({ type: 'text', text, marks: [{ type: 'link', attrs: { href: trimmedUrl } }] })
        .run();
    } else {
      // Selection with unchanged text: apply the link mark, preserving rich formatting.
      editor.chain().focus().extendMarkRange('link').setLink({ href: trimmedUrl }).run();
    }

    onClose();
  };

  const remove = () => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      apply();
    }
    if (e.key === 'Escape') {
      onClose();
      editor?.commands.focus();
    }
  };

  if (!open || !editor) return null;

  const isLinkActive = editor.isActive('link');

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <div className="flex items-center bg-slate-50 rounded-xl px-2.5 py-1.5 border border-slate-100">
        <input
          type="text"
          value={displayText}
          onChange={(e) => setDisplayText(e.target.value)}
          placeholder="Texto de exibição"
          aria-label="Texto de exibição do link"
          className="bg-transparent text-[11px] font-bold text-slate-700 outline-none w-28 placeholder-slate-300"
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="flex items-center bg-slate-50 rounded-xl px-2.5 py-1.5 border border-slate-100">
        <Link2 className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" aria-hidden="true" />
        <input
          ref={urlInputRef}
          type="text"
          autoComplete="off"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          aria-label="URL do link"
          className="bg-transparent text-[11px] font-bold text-slate-700 outline-none w-36 sm:w-48 placeholder-slate-300"
          onKeyDown={handleKeyDown}
        />
      </div>

      <button
        type="button"
        aria-label="Confirmar link"
        onMouseDown={(e) => {
          e.preventDefault();
          apply();
        }}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors"
      >
        <Check className="w-4 h-4" />
      </button>

      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir link em nova aba"
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}

      {isLinkActive && (
        <>
          <div className="w-px h-4 bg-slate-100 mx-0.5" aria-hidden="true" />
          <button
            type="button"
            aria-label="Desvincular"
            onMouseDown={(e) => {
              e.preventDefault();
              remove();
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              <line x1="4" y1="4" x2="20" y2="20" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
