import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SettingsClient } from "@/components/dashboard/settings-client"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect("/")

  return (
    <SettingsClient
      user={{
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        image: session.user.image ?? "",
      }}
    />
  )
}
