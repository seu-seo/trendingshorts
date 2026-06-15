import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const htmlPath = path.join(process.cwd(), 'templates', 'demo-v6.html');
  let html = fs.readFileSync(htmlPath, 'utf-8');
  html = html.replace(/http:\/\/localhost:\d+\/api\//g, '/api/');
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
