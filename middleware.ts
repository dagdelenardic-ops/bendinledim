import { NextRequest, NextResponse } from "next/server";

const PROTECTED_API_PREFIXES = [
  "/api/articles",
  "/api/categories",
  "/api/tags",
  "/api/seed",
  "/api/bootstrap",
  "/api/ai-generate",
  "/api/chatgpt",
  "/api/grok",
  "/api/gemini",
  "/api/rss/translate",
];

const API_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

function isProtectedApiPath(pathname: string) {
  return PROTECTED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function unauthorizedResponse() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Panel", charset="UTF-8"',
      ...API_CORS_HEADERS,
    },
  });
}

function missingCredentialsResponse() {
  return new NextResponse("ADMIN_USERNAME / ADMIN_PASSWORD is not configured", {
    status: 503,
    headers: API_CORS_HEADERS,
  });
}

function corsPreflightResponse() {
  return new NextResponse(null, {
    status: 204,
    headers: API_CORS_HEADERS,
  });
}

function isAuthorized(request: NextRequest) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) return null;

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) return false;

  const expected = `Basic ${btoa(`${username}:${password}`)}`;
  return authHeader === expected;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedApi = isProtectedApiPath(pathname);
  const isApiRoute = pathname.startsWith("/api");

  if (isProtectedApi && request.method === "OPTIONS") {
    return corsPreflightResponse();
  }

  if (
    isAdminRoute &&
    process.env.NODE_ENV === "production" &&
    process.env.ENABLE_ADMIN_DASHBOARD !== "true"
  ) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (!isAdminRoute && !isProtectedApi) {
    return NextResponse.next();
  }

  const authorization = isAuthorized(request);
  if (authorization === null) {
    return isApiRoute ? missingCredentialsResponse() : new NextResponse("Service unavailable", { status: 503 });
  }
  if (!authorization) {
    return isApiRoute ? unauthorizedResponse() : new NextResponse("Unauthorized", { status: 401 });
  }

  const response = NextResponse.next();
  if (isProtectedApi) {
    Object.entries(API_CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
