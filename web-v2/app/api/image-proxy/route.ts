import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_HOST = 'image.pollinations.ai';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }

  if (parsed.hostname !== ALLOWED_HOST) {
    return NextResponse.json({ error: 'Disallowed host' }, { status: 403 });
  }

  try {
    const res = await fetch(url, { headers: { Accept: 'image/*' } });
    if (!res.ok) {
      return NextResponse.json({ error: `Upstream ${res.status}` }, { status: 502 });
    }

    const blob = await res.blob();
    return new NextResponse(blob.stream(), {
      headers: {
        'Content-Type': res.headers.get('Content-Type') ?? 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    });
  } catch (e) {
    console.error('[/api/image-proxy]', e);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 502 });
  }
}
