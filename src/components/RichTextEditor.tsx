'use client';

import React from 'react';
import { EditorContent, Editor } from '@tiptap/react';
import { cn } from '@/utils/cn';

export function RichTextEditor({
  editor,
  className,
  onLinkClick,
}: {
  editor: Editor | null;
  className?: string;
  onLinkClick?: () => void;
}) {
  if (!editor) return null;

  return (
    <div
      className={cn(
        'overflow-y-auto no-scrollbar cursor-text relative',
        '[&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:mb-1',
        className,
      )}
      onClick={() => {
        editor.commands.focus();
        // Só abre o popover em clique simples (seleção vazia = cursor).
        // Duplo-clique para selecionar palavra não deve abrir o popover.
        if (onLinkClick && editor.isActive('link') && editor.state.selection.empty) {
          onLinkClick();
        }
      }}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
