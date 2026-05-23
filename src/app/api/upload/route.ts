import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { createLogger, generateCorrelationId } from '@/utils/logger';

const logger = createLogger('API/Upload');

export async function POST(request: Request): Promise<NextResponse> {
  // O cliente pode propagar sessionId e correlationId via headers para rastreabilidade
  // ponta a ponta entre o browser e o servidor.
  const sessionId = request.headers.get('x-session-id') ?? undefined;
  const correlationId =
    request.headers.get('x-correlation-id') ?? generateCorrelationId();

  const timer = logger.startTimer(
    'POST',
    'Processando requisição de upload de arquivo',
    correlationId,
  );

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      logger.warn('POST', "Requisição rejeitada — campo 'file' ausente no formulário", {
        sessionId,
        correlationId,
      });
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    logger.debug('POST', 'Metadados do arquivo processados', {
      sessionId,
      correlationId,
      data: {
        nome: file.name,
        tipo: file.type,
        tamanhoKb: Math.round(file.size / 1024),
      },
    });

    const blobPath = `items/${Date.now()}-${file.name}`;
    const blob = await put(blobPath, file, { access: 'public' });

    timer.concluido('Arquivo enviado para o Vercel Blob com sucesso', {
      caminho: blobPath,
      tipo: file.type,
      tamanhoKb: Math.round(file.size / 1024),
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    timer.falhou('Erro não tratado durante o upload do arquivo', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar o upload.' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const sessionId = request.headers.get('x-session-id') ?? undefined;
  const correlationId =
    request.headers.get('x-correlation-id') ?? generateCorrelationId();

  const timer = logger.startTimer(
    'DELETE',
    'Processando requisição de exclusão de blob',
    correlationId,
  );

  try {
    const body = await request.json();
    const { url } = body as { url?: string };

    if (!url) {
      logger.warn('DELETE', 'Requisição rejeitada — URL ausente no corpo da requisição', {
        sessionId,
        correlationId,
      });
      return NextResponse.json({ error: 'URL não fornecida.' }, { status: 400 });
    }

    logger.debug('DELETE', 'URL do blob recebida para exclusão', {
      sessionId,
      correlationId,
      // Registar apenas o pathname — nunca URLs completas que podem conter tokens assinados
      data: { caminho: new URL(url).pathname },
    });

    const { del } = await import('@vercel/blob');
    await del(url);

    timer.concluido('Blob excluído com sucesso');
    return NextResponse.json({ success: true });
  } catch (error) {
    timer.falhou('Falha ao excluir o blob', error);
    return NextResponse.json({ error: 'Erro ao deletar arquivo.' }, { status: 500 });
  }
}
