'use client';

import { EditorContent, Editor } from '@tiptap/react';
import { cn } from '@/utils/cn';

export function RichTextEditor({
  editor,
  className,
}: {
  editor: Editor | null;
  className?: string;
}) {
  if (!editor) return null;
  return (
    <div
      className={cn('overflow-y-auto no-scrollbar cursor-text', className)}
      onClick={() => editor.commands.focus()}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
