'use client';

import React, {
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import Image from 'next/image';
import { ImagePlus, X, RefreshCw, AlertCircle, Move } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  imagePosition?: string;
  onPositionChange?: (position: string) => void;
  className?: string;
}

export interface ImageUploadHandle {
  upload: () => Promise<string | undefined>;
}

function parsePosition(pos?: string): { x: number; y: number } {
  if (!pos) return { x: 50, y: 50 };
  const m = pos.match(/([\d.]+)%\s+([\d.]+)%/);
  return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : { x: 50, y: 50 };
}

export const ImageUpload = forwardRef<ImageUploadHandle, ImageUploadProps>(
  function ImageUploadInner({ value, onChange, imagePosition, onPositionChange, className }, ref) {
    const inputRef = useRef<HTMLInputElement>(null);
    const localErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
    const [localError, setLocalError] = useState<string | null>(null);
    const [position, setPosition] = useState(() => parsePosition(imagePosition));
    const [isPanning, setIsPanning] = useState(false);
    const dragStartRef = useRef<{
      clientX: number;
      clientY: number;
      posX: number;
      posY: number;
      containerW: number;
      containerH: number;
    } | null>(null);

    const { uploading, progress, error: uploadError, uploadImage, validateFile } = useImageUpload();

    // Pending preview takes priority over the saved URL
    const displayUrl = previewUrl ?? value;
    const errorMessage = localError ?? uploadError;
    const isBlobUrl = (url: string) => url.startsWith('blob:');

    useImperativeHandle(ref, () => ({
      upload: async (): Promise<string | undefined> => {
        if (!pendingFile) return value;

        const url = await uploadImage(pendingFile);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(undefined);
        setPendingFile(null);
        onChange(url);
        return url;
      },
    }));

    const showLocalError = useCallback((msg: string) => {
      setLocalError(msg);
      if (localErrorTimerRef.current) clearTimeout(localErrorTimerRef.current);
      localErrorTimerRef.current = setTimeout(() => setLocalError(null), 4000);
    }, []);

    const handleFileSelect = useCallback(
      (file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
          showLocalError(validationError);
          return;
        }
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setPendingFile(file);
        setLocalError(null);
        setPosition({ x: 50, y: 50 });
        onPositionChange?.('50% 50%');
      },
      [previewUrl, validateFile, showLocalError, onPositionChange],
    );

    const handleRemove = useCallback(() => {
      if (pendingFile) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(undefined);
        setPendingFile(null);
      } else {
        onChange(undefined);
      }
    }, [pendingFile, previewUrl, onChange]);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
        e.target.value = '';
      },
      [handleFileSelect],
    );

    const handleDragEnter = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
      },
      [handleFileSelect],
    );

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        inputRef.current?.click();
      }
    }, []);

    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (uploading) return;
        if ((e.target as Element).closest('button')) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        const rect = e.currentTarget.getBoundingClientRect();
        dragStartRef.current = {
          clientX: e.clientX,
          clientY: e.clientY,
          posX: position.x,
          posY: position.y,
          containerW: rect.width,
          containerH: rect.height,
        };
        setIsPanning(true);
      },
      [uploading, position],
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragStartRef.current) return;
        const { clientX, clientY, posX, posY, containerW, containerH } = dragStartRef.current;
        const dx = e.clientX - clientX;
        const dy = e.clientY - clientY;
        const newX = Math.min(100, Math.max(0, posX - dx * (100 / containerW)));
        const newY = Math.min(100, Math.max(0, posY - dy * (100 / containerH)));
        setPosition({ x: newX, y: newY });
        onPositionChange?.(`${newX.toFixed(1)}% ${newY.toFixed(1)}%`);
      },
      [onPositionChange],
    );

    const handlePointerUp = useCallback(() => {
      setIsPanning(false);
      dragStartRef.current = null;
    }, []);

    return (
      <div className={cn('space-y-2', className)}>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onChange={handleInputChange}
        />

        {displayUrl ? (
          <div
            className={cn(
              'relative w-full h-[180px] md:h-[220px] rounded-[28px] overflow-hidden touch-none select-none',
              isPanning ? 'cursor-grabbing' : 'cursor-grab',
            )}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {uploading && (
              <div className="absolute inset-0 z-10 bg-black/50 flex flex-col items-center justify-center gap-3 px-10">
                <p className="text-white text-xs font-black uppercase tracking-widest">
                  Enviando...
                </p>
                <div className="w-full bg-white/20 rounded-full h-[3px] overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            <Image
              src={displayUrl}
              alt="Imagem do item"
              fill
              className="object-cover"
              style={{ objectPosition: `${position.x}% ${position.y}%` }}
              priority={false}
              loading="lazy"
              unoptimized={isBlobUrl(displayUrl)}
              draggable={false}
            />
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remover imagem"
              className="absolute top-3 right-3 z-20 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-sm border border-white/50 active:scale-90 transition-all"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              aria-label="Trocar imagem"
              className="absolute top-3 left-3 z-20 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-sm border border-white/50 active:scale-90 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-slate-600" />
            </button>
            {!uploading && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                  <Move className="w-3 h-3" />
                  Arraste para ajustar
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            aria-label="Clique ou arraste uma foto para fazer upload"
            onKeyDown={handleKeyDown}
            onClick={() => inputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
              'w-full h-[180px] md:h-[220px] rounded-[28px] border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand-pink',
              isDragging ? 'border-brand-pink bg-brand-pink-light' : 'border-slate-200 bg-slate-50',
            )}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3 w-full px-10">
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
                  Enviando...
                </p>
                <div className="w-full bg-slate-100 rounded-full h-[3px] overflow-hidden">
                  <div
                    className="h-full bg-slate-900 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <ImagePlus className="w-10 h-10 text-slate-300" aria-hidden="true" />
                <div className="text-center">
                  <p className="text-slate-400 font-bold text-sm">Arraste uma foto aqui</p>
                  <p className="text-slate-300 text-xs font-medium">ou toque para escolher</p>
                </div>
              </>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" aria-hidden="true" />
            <p className="text-red-500 text-xs font-bold">{errorMessage}</p>
          </div>
        )}
      </div>
    );
  },
);

ImageUpload.displayName = 'ImageUpload';
