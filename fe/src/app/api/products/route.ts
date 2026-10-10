import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/api';
import type { Locale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get('locale') as Locale) || 'vi';
    const products = await getProducts(locale);
    return NextResponse.json(products ?? []);
  } catch (err) {
    console.error('[API Route] Error fetching products:', err);
    return NextResponse.json([], { status: 500 });
  }
}
