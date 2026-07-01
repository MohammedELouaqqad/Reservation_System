import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck2, Clock3, Package, Plus } from "lucide-react";
import { Protected } from "@/components/Protected";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/dates";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({ meta: [{ title: "Tableau de bord · ReservationSystem" }] }),
  component: () => (
    <Protected>
      <Dashboard />
    </Protected>
  ),
});

function Dashboard() {
  const { user, isAdmin } = useAuth();
  const ressources = useQuery({ queryKey: ["ressources"], queryFn: api.listRessources });
  const reservations = useQuery({ queryKey: ["reservations"], queryFn: api.listReservations });

  const availableCount =
    ressources.data?.filter((r) => r.status === "FREE" && r.availableQuantity > 0).length ?? 0;
  const myReservations = reservations.data?.length ?? 0;
  const upcomingCount =
    reservations.data?.filter((r) => {
      if (!r.startDateTime) return false;
      return new Date(r.startDateTime).getTime() >= Date.now();
    }).length ?? 0;

  const recentReservations = (reservations.data ?? []).slice(0, 3);

  return (
    <>
      <PageHeader
        title={`Bonjour ${user?.name?.split(" ")[0] ?? ""}`}
        description={
          isAdmin
            ? "Vue d'ensemble de l'activité de réservation"
            : "Suivez vos réservations et parcourez les ressources disponibles"
        }
        action={
          <Button asChild>
            <Link to="/reservations/new">
              <Plus className="mr-2 h-4 w-4" /> Nouvelle réservation
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Package className="h-5 w-5" />}
          label="Ressources disponibles"
          value={ressources.isLoading ? "…" : String(availableCount)}
        />
        <StatCard
          icon={<CalendarCheck2 className="h-5 w-5" />}
          label={isAdmin ? "Réservations totales" : "Mes réservations"}
          value={reservations.isLoading ? "…" : String(myReservations)}
        />
        <StatCard
          icon={<Clock3 className="h-5 w-5" />}
          label="À venir"
          value={reservations.isLoading ? "…" : String(upcomingCount)}
        />
      </div>

      <Card className="mt-8">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {isAdmin ? "Dernières réservations" : "Mes prochaines réservations"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Accès rapide à votre activité récente
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/resources">Voir les ressources</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/reservations">Voir les réservations</Link>
              </Button>
            </div>
          </div>

          {reservations.isLoading && (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          )}

          {!reservations.isLoading && recentReservations.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucune réservation pour le moment. Commencez par parcourir les ressources
              disponibles.
            </p>
          )}

          {recentReservations.length > 0 && (
            <div className="grid gap-3">
              {recentReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex flex-col gap-1 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-medium">
                      {reservation.ressource?.name ?? `Ressource #${reservation.ressource?.id}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateTime(reservation.startDateTime)} →{" "}
                      {formatDateTime(reservation.endDateTime)}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Qté {reservation.quantity}
                    {isAdmin && reservation.user?.name
                      ? ` · ${reservation.user.name}`
                      : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
