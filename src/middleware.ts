import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './navigation';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Execute the i18n middleware to get the response
  const response = intlMiddleware(request);

  // Extract token from URL
  let token = request.nextUrl.searchParams.get('token');
  const hasExistingToken = request.cookies.has('assessment_embed_token');

  if (!token && hasExistingToken) {
    token = request.cookies.get('assessment_embed_token')?.value || null;
  }

  let allowedFrameOrigin = "'self'";

  if (token) {
    // If it's a new token from URL, save it
    if (request.nextUrl.searchParams.has('token')) {
      response.cookies.set('assessment_embed_token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 2 * 60 * 60, // 2 hours
      });
    }

    // Try to decode the JWT payload to get the allowed origin
    try {
      const base64Url = token.split('.')[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
        const payload = JSON.parse(jsonPayload);
        if (payload.origin) {
          allowedFrameOrigin = `'self' ${payload.origin}`;
        }
      }
    } catch (e) {
      // Ignore decoding errors, fallback to 'self'
    }
  }

  // Strictly enforce frame-ancestors:
  // If token is missing/invalid, it's 'self' (blocks external iframes)
  // If token is present, it's 'self' + the specific origin from the token
  response.headers.set('Content-Security-Policy', `frame-ancestors ${allowedFrameOrigin}`);

  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(kh|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
