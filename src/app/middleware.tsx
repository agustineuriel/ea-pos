import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const pathname = req.nextUrl.pathname;

    // Allow requests to /login, /auth, and static files without checking for a token
    if (pathname.startsWith('/login') || pathname.startsWith('/auth') || /\.(png|jpe?g|svg|gif|webp|js|css)$/.test(pathname)) {
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url)); // Corrected redirect path
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], // Match all paths except those starting with /api, /_next, etc.
};
