import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './navigation';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Execute the i18n middleware to get the response
  const response = intlMiddleware(request);

  // Extract token from URL
  const token = request.nextUrl.searchParams.get('token');
  if (token) {
    // Save token securely in a cookie
    // Max age is 2 hours to match the backend token expiry
    response.cookies.set('assessment_embed_token', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 2 * 60 * 60, // 2 hours
    });
  }

  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(kh|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
