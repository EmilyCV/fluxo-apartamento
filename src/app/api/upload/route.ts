import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.' },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. O tamanho máximo é 5MB.' },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      upload_preset: 'ape2026_items',
      folder: 'ape2026/items',
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    const detail = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('Erro no upload Cloudinary:', detail);
    return NextResponse.json({ error: 'Erro interno no servidor.', detail }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? 'AUSENTE',
    api_key: process.env.CLOUDINARY_API_KEY
      ? `${process.env.CLOUDINARY_API_KEY.slice(0, 4)}... (${process.env.CLOUDINARY_API_KEY.length} chars)`
      : 'AUSENTE',
    api_secret: process.env.CLOUDINARY_API_SECRET
      ? `set (${process.env.CLOUDINARY_API_SECRET.length} chars)`
      : 'AUSENTE',
  });
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as { publicId?: string };

    if (!body.publicId) {
      return NextResponse.json({ error: 'publicId não fornecido.' }, { status: 400 });
    }

    await cloudinary.uploader.destroy(body.publicId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    return NextResponse.json({ error: 'Erro ao deletar imagem.' }, { status: 500 });
  }
}
