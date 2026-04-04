import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { CheckoutClient } from "@/components/dashboard/checkout-client"

export default async function CheckoutPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  return (
    <CheckoutClient
      user={{
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      }}
    />
  )
}
