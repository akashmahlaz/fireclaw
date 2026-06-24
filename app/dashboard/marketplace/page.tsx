import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { MarketplaceClient } from "@/components/dashboard/marketplace-client"

export default async function MarketplacePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")
  return <MarketplaceClient />
}
