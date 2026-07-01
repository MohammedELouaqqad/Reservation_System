import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { CalendarCheck2, LayoutDashboard, LogOut, Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { ReactNode } from "react";

const nav = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/resources", label: "Ressources", icon: Package },
  { to: "/reservations", label: "Réservations", icon: CalendarCheck2 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const logout = () => {
    auth.clear();
    navigate({ to: "/login", replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">ReservationSystem</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              const active = pathname === item.to || pathname.startsWith(item.to + "/");
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors " +
                    (active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden text-right sm:block">
                <div className="text-sm font-medium leading-none">{user.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {isAdmin ? "Administrateur" : "Utilisateur"}
                </div>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" /> Déconnexion
            </Button>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
          {nav.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  "flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium " +
                  (active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground")
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="flex gap-2">{action}</div>}
    </div>
  );
}

export { Plus };
