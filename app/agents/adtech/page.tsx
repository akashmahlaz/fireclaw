import { auth } from "@/auth";
import { AdTechPage } from "./client";

export const metadata = {
  title: "Ad-Chain Verify Agent — Programmatic Supply Chain Verification | FireClaw",
  description:
    "Verify ads.txt, app-ads.txt, and sellers.json at scale. Crawl thousands of apps and websites to ensure supply chain compliance.",
};

export default async function Page() {
  const session = await auth();
  return (
    <AdTechPage
      user={
        session?.user
          ? { name: session.user.name ?? null, email: session.user.email ?? null }
          : null
      }
    />
  );
}
