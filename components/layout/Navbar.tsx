
import { auth } from "@/auth"
import { NavbarClient } from "./NavbarClient"

export default async function Navbar() {
  const session = await auth()
  const isLoggedIn = !!session

  return <NavbarClient isLoggedIn={isLoggedIn} />
}