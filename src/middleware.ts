import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is in the dashboard
  if (pathname.startsWith('/dashboard')) {
    // Get the user's session token
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    // If no token, redirect to login
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(pathname));
      return NextResponse.redirect(url);
    }
    
    const userRole = token.role as string;
    
    // Role-based access control
    if (userRole === 'author') {
      // Authors can only access the posts page and profile page
      if (!pathname.startsWith('/dashboard/posts') && 
          !pathname.startsWith('/dashboard/profile') && 
          pathname !== '/dashboard') {
        // Redirect authors to the posts page if they try to access other pages
        return NextResponse.redirect(new URL('/dashboard/posts', request.url));
      }
    } else if (userRole === 'editor') {
      // Editors can access most pages except admin-only pages
      if (pathname.startsWith('/dashboard/users') || 
          pathname.startsWith('/dashboard/settings')) {
        // Redirect editors to the dashboard if they try to access admin-only pages
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    // Admins can access all pages, so no restrictions needed
  }
  
  return NextResponse.next();
}

// Configure the middleware to run only on dashboard routes
export const config = {
  matcher: ['/dashboard/:path*'],
}; 