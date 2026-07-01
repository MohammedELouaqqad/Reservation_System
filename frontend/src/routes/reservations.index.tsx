import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Protected } from "@/components/Protected";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api, ApiError, type Reservation } from "@/lib/api";
import { formatDateTime } from "@/lib/dates";
import { useAuth } from "@/hooks/use-auth";
import { EmptyState, ErrorState, SkeletonGrid } from "./resources.index";

export const Route = createFileRoute("/reservations/")({
  ssr: false,
  head: () => ({ meta: [{ title: "Réservations · ReservationSystem" }] }),
  component: () => (
    <Protected>
      <ReservationsList />
    </Protected>
  ),
});

function userLabel(reservation: Reservation) {
  return reservation.user?.name || reservation.user?.email || "Utilisateur inconnu";
}

function ReservationsList() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [toDelete, setToDelete] = useState<Reservation | null>(null);

  const reservations = useQuery({ queryKey: ["reservations"], queryFn: api.listReservations });
  const ressources = useQuery({ queryKey: ["ressources"], queryFn: api.listRessources });

  const ressourceName = (rid?: number) =>
    ressources.data?.find((r) => r.id === rid)?.name ?? `Ressource #${rid}`;

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.deleteReservation(id),
    onSuccess: () => {
      toast.success("Réservation supprimée");
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["ressources"] });
      setToDelete(null);
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Erreur"),
  });

  return (
    <>
      <PageHeader
        title={isAdmin ? "Toutes les réservations" : "Mes réservations"}
        description={
          isAdmin
            ? "Consultez et gérez l'ensemble des réservations"
            : "Retrouvez uniquement vos propres réservations"
        }
        action={
          <Button asChild>
            <Link to="/reservations/new">
              <Plus className="mr-2 h-4 w-4" /> Nouvelle réservation
            </Link>
          </Button>
        }
      />

      {reservations.isLoading && <SkeletonGrid />}
      {reservations.error && (
        <ErrorState
          message={
            reservations.error instanceof ApiError
              ? reservations.error.message
              : "Erreur de chargement"
          }
        />
      )}

      {reservations.data && reservations.data.length === 0 && (
        <EmptyState
          title="Aucune réservation"
          description="Créez votre première réservation."
          action={
            <Button asChild>
              <Link to="/reservations/new">
                <Plus className="mr-2 h-4 w-4" /> Nouvelle réservation
              </Link>
            </Button>
          }
        />
      )}

      {reservations.data && reservations.data.length > 0 && (
        <div className="grid gap-3">
          {reservations.data.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
                    #{r.id}
                  </div>
                  <div>
                    <div className="font-medium">{ressourceName(r.ressource?.id)}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {formatDateTime(r.startDateTime)} → {formatDateTime(r.endDateTime)}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Quantité : <span className="font-medium text-foreground">{r.quantity}</span>
                      {isAdmin && (
                        <>
                          <span className="mx-2">·</span>
                          {userLabel(r)}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setToDelete(r)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette réservation ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toDelete && deleteMut.mutate(toDelete.id)}
              disabled={deleteMut.isPending}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
