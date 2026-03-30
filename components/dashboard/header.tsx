import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface DashboardHeaderProps {
  user: { name?: string | null };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <h2 className="font-heading text-sm font-medium text-muted-foreground">
        Welcome, {user.name ?? "User"}
      </h2>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <Button variant="ghost" size="sm" type="submit" className="gap-1.5 text-muted-foreground">
          <LogOut className="size-3.5" />
          Sign out
        </Button>
      </form>
    </header>
  );
}
