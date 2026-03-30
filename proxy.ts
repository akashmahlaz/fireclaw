import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { NextFetchEvent } from "next/server"

const { auth } = NextAuth(authConfig)

const proxyHandler = auth((req) => {
	const { pathname } = req.nextUrl

	// Protect dashboard routes
	if (pathname.startsWith("/dashboard") && !req.auth) {
		const loginUrl = new URL("/login", req.url)
		loginUrl.searchParams.set("callbackUrl", pathname)
		return NextResponse.redirect(loginUrl)
	}

	// Redirect logged-in users away from login page
	if (pathname === "/login" && req.auth) {
		return NextResponse.redirect(new URL("/dashboard", req.url))
	}

	return NextResponse.next()
})

export function proxy(request: NextRequest, event: NextFetchEvent) {
	return proxyHandler(request, event)
}

export const config = {
	matcher: ["/dashboard/:path*", "/login"],
}