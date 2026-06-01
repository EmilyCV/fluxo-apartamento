'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EditorContent, Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Link2, Trash2, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/utils/cn';

export function RichTextEditor({
  editor,
  className,
}: {
  editor: Editor | null;
  className?: string;
}) {
  const [linkUrl, setLinkUrl] = useState('');
  // Snapshot of the PM selection taken when the URL input receives focus,
  // so we can restore it after the editor loses DOM focus.
  const savedSelectionRef = useRef<{ from: number; to: number } | null>(null);
  // When true, BubbleMenu stays visible even if editor.isActive('link')
  // temporarily returns false while focus is in the URL input.
  const isEditingUrlRef = useRef(false);

  useEffect(() => {
    if (!editor) return;
    const sync = () => {
      if (editor.isActive('link')) {
        setLinkUrl(editor.getAttributes('link').href ?? '');
      }
    };
    editor.on('transaction', sync);
    return () => { editor.off('transaction', sync); };
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    isEditingUrlRef.current = false;

    const chain = editor.chain();
    // Restore selection first (input focus may have moved cursor elsewhere)
    if (savedSelectionRef.current) {
      const { from, to } = savedSelectionRef.current;
      chain.setTextSelection({ from, to });
    }
    // Apply or remove the link, then re-focus the editor at the end of the chain
    if (linkUrl) {
      chain.extendMarkRange('link').setLink({ href: linkUrl }).focus().run();
    } else {
      chain.extendMarkRange('link').unsetLink().focus().run();
    }
    savedSelectionRef.current = null;
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    isEditingUrlRef.current = false;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        'overflow-y-auto no-scrollbar cursor-text relative',
        '[&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:mb-1',
        className
      )}
      onClick={() => editor.commands.focus()}
    >
      <BubbleMenu
        editor={editor}
        shouldShow={({ editor: ed }) =>
          // Stay visible while the URL input is being edited, even if the editor
          // temporarily reports isActive('link') = false due to focus change.
          ed.isActive('link') || isEditingUrlRef.current
        }
      >
        <div className="flex items-center gap-1 bg-white border border-slate-200 shadow-xl rounded-2xl p-1.5">
          <div className="flex items-center bg-slate-50 rounded-xl px-2.5 py-1.5 border border-slate-100">
            <Link2 className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="bg-transparent text-[11px] font-bold text-slate-700 outline-none w-36 sm:w-52 placeholder-slate-300"
              onFocus={() => {
                isEditingUrlRef.current = true;
                // Snapshot the PM selection so applyLink can restore it
                const { from, to } = editor.state.selection;
                savedSelectionRef.current = { from, to };
              }}
              onBlur={() => {
                // Only clear the editing flag if the user is not pressing Check
                // (Check uses onMouseDown+preventDefault which fires before onBlur)
                isEditingUrlRef.current = false;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
                if (e.key === 'Escape') { isEditingUrlRef.current = false; editor.commands.focus(); }
              }}
            />
          </div>

          {/* onMouseDown + preventDefault keeps the URL input focused through
              the mousedown phase so onBlur doesn't fire before applyLink runs */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); applyLink(); }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors"
            title="Confirmar link"
          >
            <Check className="w-4 h-4" />
          </button>

          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-colors"
            title="Abrir link"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="w-px h-4 bg-slate-100 mx-0.5" />

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); removeLink(); }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Remover link"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </BubbleMenu>

      <EditorContent editor={editor} />
    </div>
  );
}
