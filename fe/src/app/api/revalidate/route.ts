import { revalidateTag } from 'next/cache';
import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

// Chỉ cho phép revalidate các tag đã biết
const ALLOWED_TAGS = new Set(['banners']);

function secretMatches(provided: string | null, expected: string) {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET_TOKEN;
  if (!expected || !secretMatches(request.headers.get('x-revalidate-secret'), expected)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags) ? body.tags.filter((t): t is string => typeof t === 'string') : [];
  const valid = tags.filter((t) => ALLOWED_TAGS.has(t));
  if (!valid.length) return NextResponse.json({ message: 'No valid tags' }, { status: 400 });

  for (const tag of valid) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ revalidated: valid });
}
