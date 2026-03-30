import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const { auth } = NextAuth(authConfig)

export async function proxy(request: NextRequest) {
	return auth((req) => {
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
	})(request)
}

export const config = {
	matcher: ["/dashboard/:path*", "/login"],
}