import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes that don't require auth
const PUBLIC_PATHS = [
  '/', // home page
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password'
];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Allow public routes
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Restrict /admin routes to admin users only
  if (pathname.startsWith('/admin') && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // All good
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
