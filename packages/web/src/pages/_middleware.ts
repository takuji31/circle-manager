import { JWT } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';
import { NextMiddleware, NextRequest, NextResponse } from 'next/server';

const middleware: NextMiddleware = ((
  req: NextRequest & { nextauth: { token: JWT } }
) => {
  const url = req.nextUrl.clone();
  if (url.pathname == '/' && req.nextauth.token.isAdmin) {
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }
  return undefined;
}) as unknown as NextMiddleware;

export default withAuth(middleware, {
  callbacks: {
    authorized: ({ req, token }) =>
      !!token || req.nextUrl.pathname.startsWith('/api/'),
  },
});
