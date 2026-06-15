import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    // O método put do @vercel/blob faz o upload e retorna os metadados
    const blob = await put(`items/${Date.now()}-${file.name}`, file, {
      access: 'public',
    });

    // Retorna exatamente o formato esperado pelo frontend { url: string }
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Erro no upload Vercel Blob:', error);
    return NextResponse.json({ error: 'Erro interno ao processar o upload.' }, { status: 500 });
  }
}

/**
 * Rota para deletar blobs da Vercel
 * O frontend pode chamar esta rota passando a URL do blob
 */
export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL não fornecida.' }, { status: 400 });
    }

    const { del } = await import('@vercel/blob');
    await del(url);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar blob:', error);
    return NextResponse.json({ error: 'Erro ao deletar arquivo.' }, { status: 500 });
  }
}
