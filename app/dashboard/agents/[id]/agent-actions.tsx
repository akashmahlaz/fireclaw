"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, Trash2 } from "lucide-react";

export function AgentActions({
  agentId,
  status,
}: {
  agentId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleReboot() {
    setLoading("reboot");
    try {
      await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reboot" }),
      });
      router.refresh();
    } catch (err) {
      console.error("Reboot failed:", err);
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure? This will permanently destroy the agent and its server.")) {
      return;
    }
    setLoading("delete");
    try {
      const res = await fetch(`/api/agents/${agentId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/agents");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        disabled={loading !== null || status !== "running"}
        onClick={handleReboot}
      >
        {loading === "reboot" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RotateCcw className="size-4" />
        )}
        Restart Agent
      </Button>
      <Button
        variant="destructive"
        disabled={loading !== null}
        onClick={handleDelete}
      >
        {loading === "delete" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
        Delete Agent
      </Button>
    </div>
  );
}
