'use client';

import { useState, useCallback, useRef } from 'react';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setErrorWithTimeout = useCallback((msg: string) => {
    setError(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(null), 4000);
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.';
    }
    if (file.size > MAX_SIZE) {
      return 'Arquivo muito grande. O tamanho máximo é 5MB.';
    }
    return null;
  }, []);

  /**
   * Faz o upload para a nossa rota de API que agora usa Vercel Blob
   */
  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
      const validationError = validateFile(file);
      if (validationError) {
        setErrorWithTimeout(validationError);
        throw new Error(validationError);
      }

      setUploading(true);
      setProgress(0);
      setError(null);

      // Simulação de progresso para Vercel Blob (que não expõe progresso nativo no lado do servidor)
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 200);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = (await response.json()) as { url?: string; error?: string };

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao enviar a imagem.');
        }

        setProgress(100);
        return data.url!;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao enviar a imagem.';
        setErrorWithTimeout(message);
        throw err;
      } finally {
        clearInterval(progressInterval);
        setUploading(false);
        setTimeout(() => setProgress(0), 500);
      }
    },
    [validateFile, setErrorWithTimeout],
  );

  /**
   * Deleta um arquivo via API route
   */
  const deleteImage = useCallback(async (url: string, correlationId?: string) => {
    try {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(correlationId ? { 'x-correlation-id': correlationId } : {}),
        },
        body: JSON.stringify({ url }),
      });
    } catch (err) {
      console.error('Erro ao deletar imagem:', err);
    }
  }, []);

  return { uploading, progress, error, uploadImage, deleteImage, validateFile };
}
