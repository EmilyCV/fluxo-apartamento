'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { Bold, Italic, Underline as UnderlineIcon, ChevronDown, Palette } from 'lucide-react';
import { cn } from '@/utils/cn';

const SIZE_PRESETS = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72];

const FONT_FAMILIES = [
  { label: 'Padrão', value: '' },
  { label: 'Serifa', value: 'Georgia, serif' },
  { label: 'Mono', value: 'ui-monospace, SFMono-Regular, monospace' },
] as const;

const COLOR_PRESETS = [
  { label: 'Preto', value: '#0f172a' },
  { label: 'Cinza', value: '#64748b' },
  { label: 'Vermelho', value: '#ef4444' },
  { label: 'Laranja', value: '#f97316' },
  { label: 'Âmbar', value: '#d97706' },
  { label: 'Verde', value: '#16a34a' },
  { label: 'Azul', value: '#2563eb' },
  { label: 'Roxo', value: '#9333ea' },
  { label: 'Rosa', value: '#db2777' },
];

export function RichTextToolbar({ editor }: { editor: Editor | null }) {
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const fontMenuRef = useRef<HTMLDivElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const customColorRef = useRef<HTMLInputElement>(null);
  const customSizeInputRef = useRef<HTMLInputElement>(null);

  // Re-render on every editor transaction so active states stay in sync
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const update = () => forceUpdate((n) => n + 1);
    editor.on('transaction', update);
    return () => {
      editor.off('transaction', update);
    };
  }, [editor]);

  // Close menus on outside click
  useEffect(() => {
    if (!showFontMenu && !showColorMenu && !showSizeMenu) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (
        fontMenuRef.current?.contains(e.target as Node) ||
        colorMenuRef.current?.contains(e.target as Node) ||
        sizeMenuRef.current?.contains(e.target as Node)
      )
        return;
      setShowFontMenu(false);
      setShowColorMenu(false);
      setShowSizeMenu(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [showFontMenu, showColorMenu, showSizeMenu]);

  if (!editor) return null;

  // Font size
  const rawFontSize = editor.getAttributes('textStyle').fontSize as string | undefined;
  const currentFontSize = rawFontSize ? rawFontSize.replace('px', '') : '16';

  const applyFontSize = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 8 && num <= 96) {
      editor.chain().focus().setFontSize(`${num}px`).run();
    }
    setShowSizeMenu(false);
  };

  // Text color
  const currentColor = (editor.getAttributes('textStyle').color as string | undefined) || '';

  const applyColor = (value: string | null) => {
    if (value) editor.chain().focus().setColor(value).run();
    else editor.chain().focus().unsetColor().run();
    setShowColorMenu(false);
  };

  // Font family
  const currentFontValue =
    (editor.getAttributes('textStyle').fontFamily as string | undefined) || '';
  const currentFont = FONT_FAMILIES.find((f) => f.value === currentFontValue)?.label ?? 'Padrão';

  const applyFont = (value: string) => {
    const chain = editor.chain().focus();
    const withScope = editor.view.state.selection.empty ? chain.selectAll() : chain;
    if (value) withScope.setFontFamily(value).run();
    else withScope.unsetFontFamily().run();
    setShowFontMenu(false);
  };

  const activeBtn = 'bg-slate-900 text-white';
  const idleBtn = 'text-slate-400 hover:bg-black/5 hover:text-slate-700';

  return (
    <div className="flex items-center gap-0.5">
      {/* Tamanho da fonte — botão display + dropdown com input de precisão */}
      <div className="relative shrink-0" ref={sizeMenuRef}>
        <div
          className="flex items-center h-7 rounded-xl border border-black/10 bg-white/60 hover:border-black/20 transition-all overflow-hidden cursor-pointer"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowSizeMenu((s) => !s);
            setShowColorMenu(false);
            setShowFontMenu(false);
          }}
        >
          <span className="w-8 text-center text-[11px] font-black text-slate-600 px-1 select-none">
            {currentFontSize}
          </span>
          <span className="h-full px-1 border-l border-black/10 text-slate-400 flex items-center">
            <ChevronDown
              className={cn('w-2.5 h-2.5 transition-transform', showSizeMenu && 'rotate-180')}
            />
          </span>
        </div>

        {showSizeMenu && (
          <div className="absolute top-full left-0 mt-1.5 bg-white rounded-[18px] shadow-xl border border-slate-100 py-1.5 z-[300] w-16">
            {/* Input de tamanho personalizado — dentro do dropdown, pode receber foco */}
            <div className="px-2 pb-1.5 border-b border-slate-100 mb-1">
              <input
                ref={customSizeInputRef}
                type="number"
                min={8}
                max={96}
                placeholder={currentFontSize}
                className="w-full text-center text-[11px] font-black text-slate-700 bg-slate-50 rounded-lg outline-none px-1 py-0.5 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyFontSize(e.currentTarget.value || currentFontSize);
                  if (e.key === 'Escape') setShowSizeMenu(false);
                }}
                onBlur={(e) => {
                  if (!sizeMenuRef.current?.contains(e.relatedTarget as Node)) {
                    if (e.currentTarget.value) applyFontSize(e.currentTarget.value);
                    else setShowSizeMenu(false);
                  }
                }}
              />
            </div>

            <div className="max-h-40 overflow-y-auto thin-scrollbar">
              {SIZE_PRESETS.map((size) => (
                <button
                  key={size}
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyFontSize(String(size));
                  }}
                  className={cn(
                    'w-full text-center px-3 py-1 text-[11px] font-bold transition-all',
                    String(size) === currentFontSize
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-black/10 mx-0.5 shrink-0" />

      {/* Negrito */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
        }}
        aria-label="Negrito"
        aria-pressed={editor.isActive('bold')}
        className={cn(
          'w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0',
          editor.isActive('bold') ? activeBtn : idleBtn,
        )}
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      {/* Itálico */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleItalic().run();
        }}
        aria-label="Itálico"
        aria-pressed={editor.isActive('italic')}
        className={cn(
          'w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0',
          editor.isActive('italic') ? activeBtn : idleBtn,
        )}
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      {/* Sublinhado */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleUnderline().run();
        }}
        aria-label="Sublinhado"
        aria-pressed={editor.isActive('underline')}
        className={cn(
          'w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0',
          editor.isActive('underline') ? activeBtn : idleBtn,
        )}
      >
        <UnderlineIcon className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-black/10 mx-0.5 shrink-0" />

      {/* Cor do texto */}
      <div className="relative shrink-0" ref={colorMenuRef}>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowColorMenu((s) => !s);
            setShowFontMenu(false);
            setShowSizeMenu(false);
          }}
          aria-label="Cor do texto"
          className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-500 hover:bg-black/5 transition-all"
        >
          <div className="relative flex flex-col items-center gap-px">
            <span className="text-[11px] font-black leading-none text-slate-700">A</span>
            <div
              className="w-3.5 h-[2.5px] rounded-full transition-colors"
              style={{ backgroundColor: currentColor || '#0f172a' }}
            />
          </div>
        </button>

        {showColorMenu && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-white rounded-[20px] shadow-xl border border-slate-100 p-3 z-[300] w-[168px]">
            {/* Reset */}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                applyColor(null);
              }}
              className="w-full text-left text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors mb-2 px-1"
            >
              Padrão
            </button>

            {/* Swatches */}
            <div className="grid grid-cols-5 gap-1.5">
              {COLOR_PRESETS.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyColor(value);
                  }}
                  aria-label={label}
                  className={cn(
                    'w-7 h-7 rounded-full transition-all hover:scale-110 active:scale-95',
                    currentColor === value && 'ring-2 ring-offset-1 ring-slate-900 scale-110',
                  )}
                  style={{ backgroundColor: value }}
                />
              ))}

              {/* Cor personalizada */}
              <label
                className="w-7 h-7 rounded-full cursor-pointer hover:scale-110 transition-transform overflow-hidden"
                title="Cor personalizada"
                aria-label="Cor personalizada"
              >
                <input
                  ref={customColorRef}
                  type="color"
                  className="sr-only"
                  value={currentColor || '#000000'}
                  onChange={(e) => {
                    editor.chain().focus().setColor(e.target.value).run();
                  }}
                />
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background:
                      'conic-gradient(from 0deg, #f87171, #fb923c, #facc15, #4ade80, #60a5fa, #c084fc, #f87171)',
                  }}
                >
                  <Palette className="w-3 h-3 text-white/80" />
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-black/10 mx-0.5 shrink-0" />

      {/* Fonte */}
      <div className="relative shrink-0" ref={fontMenuRef}>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowFontMenu((s) => !s);
            setShowColorMenu(false);
            setShowSizeMenu(false);
          }}
          className="flex items-center gap-0.5 h-7 px-2 rounded-xl text-[10px] font-black text-slate-500 hover:bg-black/5 transition-all uppercase tracking-widest whitespace-nowrap"
        >
          {currentFont}
          <ChevronDown
            className={cn('w-3 h-3 transition-transform shrink-0', showFontMenu && 'rotate-180')}
          />
        </button>
        {showFontMenu && (
          <div className="absolute top-full left-0 mt-1.5 bg-white rounded-[18px] shadow-xl border border-slate-100 p-1.5 z-[300] min-w-[140px]">
            {FONT_FAMILIES.map(({ label, value }) => (
              <button
                key={label}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFont(value);
                }}
                style={{ fontFamily: value || undefined }}
                className={cn(
                  'w-full text-left px-3 py-1.5 rounded-[12px] text-sm font-bold transition-all',
                  currentFont === label
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-50',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
