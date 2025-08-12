import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_ROUTES = ["/"];
const AUTH_ROUTES = ["/login", "/register"];
const API_AUTH_PREFIX = "/api/auth";
const DEFAULT_LOGIN_REDIRECT = "/dashboard";
const LOGIN_ROUTE = "/login";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const currentPath = nextUrl.pathname;

  const isApiAuthRoute = currentPath.startsWith(API_AUTH_PREFIX);
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(currentPath);
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const isAuthRoute = AUTH_ROUTES.includes(currentPath);
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
  }

  const isProtectedRoute = !isAuthRoute && !isPublicRoute;
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL(LOGIN_ROUTE, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
