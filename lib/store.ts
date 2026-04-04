import { create } from "zustand"

export type PlanTier = "starter" | "standard" | "pro" | "enterprise" | null

export interface UserPlanState {
  // Plan info
  tier: PlanTier
  agentLimit: number
  agentCount: number

  // Subscription status
  subscriptionStatus: "active" | "halted" | "cancelled" | "none"
  currentPeriodEnd: string | null

  // Actions
  setPlan: (tier: PlanTier, agentLimit: number) => void
  setAgentCount: (count: number) => void
  setSubscriptionStatus: (status: UserPlanState["subscriptionStatus"], periodEnd?: string | null) => void
  canDeploy: () => boolean
  reset: () => void
}

const TIER_LIMITS: Record<string, number> = {
  starter: 1,
  standard: 3,
  pro: 10,
  enterprise: 100,
}

export const useUserPlan = create<UserPlanState>((set, get) => ({
  tier: null,
  agentLimit: 0,
  agentCount: 0,
  subscriptionStatus: "none",
  currentPeriodEnd: null,

  setPlan: (tier, agentLimit) =>
    set({ tier, agentLimit: agentLimit || TIER_LIMITS[tier ?? ""] || 0 }),

  setAgentCount: (count) => set({ agentCount: count }),

  setSubscriptionStatus: (status, periodEnd) =>
    set({
      subscriptionStatus: status,
      currentPeriodEnd: periodEnd ?? null,
    }),

  canDeploy: () => {
    const state = get()
    if (state.subscriptionStatus !== "active" && state.tier !== null) return false
    if (state.tier === null) return true // Free trial / no plan yet — allow first deploy
    return state.agentCount < state.agentLimit
  },

  reset: () =>
    set({
      tier: null,
      agentLimit: 0,
      agentCount: 0,
      subscriptionStatus: "none",
      currentPeriodEnd: null,
    }),
}))
