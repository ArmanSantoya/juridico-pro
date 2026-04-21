import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Dejar que el cliente maneje la autenticación
  // El middleware no debería hacer validaciones asíncronas
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
