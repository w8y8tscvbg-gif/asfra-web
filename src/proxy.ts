import { NextResponse, type NextRequest } from "next/server";

/**
 * Spanish is the default language and has no URL prefix: "/agencias" is served by "/es/agencias".
 * English lives under "/en". A visit to "/es/..." is redirected to the clean URL.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/en" || pathname.startsWith("/en/")) return NextResponse.next();

  // Generated share images (/es/opengraph-image) are linked with their locale prefix; serve them as-is.
  if (pathname.endsWith("/opengraph-image")) return NextResponse.next();

  if (pathname === "/es" || pathname.startsWith("/es/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/es${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|favicon.ico|sitemap.xml|robots.txt|brand|.*\\..*).*)"],
};
