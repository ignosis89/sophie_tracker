import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { SESSION_COOKIE_NAME } from '@/lib/constants';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isValid = await verifySessionToken(token);

  if (!isValid) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!login|_next/static|_next/image|favicon.ico).*)'],
};
