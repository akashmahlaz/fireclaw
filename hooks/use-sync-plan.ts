"use client"

import { useEffect } from "react"
import { useSubscription } from "@/hooks/use-queries"
import { useUserPlan, type PlanTier } from "@/lib/store"

/**
 * Syncs subscription data from the API (via TanStack Query) into the Zustand store.
 * Place this in the dashboard layout or shell so it runs on every dashboard page.
 */
export function useSyncPlanStore() {
  const { data } = useSubscription()
  const { setPlan, setAgentCount, setSubscriptionStatus } = useUserPlan()

  useEffect(() => {
    if (!data) return

    if (data.subscription) {
      setPlan(data.subscription.tier as PlanTier, data.subscription.agentLimit)
      setSubscriptionStatus(
        data.subscription.status as "active" | "halted" | "cancelled" | "none",
        data.subscription.currentPeriodEnd,
      )
    } else {
      setPlan(null, 0)
      setSubscriptionStatus("none")
    }

    setAgentCount(data.quota.used)
  }, [data, setPlan, setAgentCount, setSubscriptionStatus])
}
