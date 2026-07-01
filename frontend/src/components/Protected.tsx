import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "./AppShell";

export function Protected({
  children,
  adminOnly = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const { user, ready, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
    } else if (adminOnly && !isAdmin) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [ready, user, isAdmin, adminOnly, navigate]);

  if (!ready || !user || (adminOnly && !isAdmin)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Chargement…</div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
