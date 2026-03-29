import NextAuth from "next-auth"
import authConfig from "./auth.config"

const { auth } = NextAuth(authConfig)

export function proxy(request: Request) {
	return auth(request)
}