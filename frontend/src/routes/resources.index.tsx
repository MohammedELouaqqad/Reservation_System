import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Protected } from "@/components/Protected";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { api, ApiError, type Ressource } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { canReserveRessource, sortRessources } from "@/lib/resources";

export const Route = createFileRoute("/resources/")({
  ssr: false,
  head: () => ({ meta: [{ title: "Ressources · ReservationSystem" }] }),
  component: () => (
    <Protected>
      <ResourcesList />
    </Protected>
  ),
});

const CATEGORY_LABELS: Record<Ressource["category"], string> = {
  SPACE: "Espace",
  EQUIPMENT: "Équipement",
  IT_INFRASTRUCTURE: "Infrastructure IT",
};

function ResourcesList() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["ressources"],
    queryFn: api.listRessources,
  });
  const [toDelete, setToDelete] = useState<Ressource | null>(null);

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.deleteRessource(id),
    onSuccess: () => {
      toast.success("Ressource supprimée");
      qc.invalidateQueries({ queryKey: ["ressources"] });
      setToDelete(null);
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Erreur"),
  });

  const sortedData = data ? sortRessources(data) : [];

  return (
    <>
      <PageHeader
        title="Ressources"
        description="Liste des ressources disponibles à la réservation"
        action={
          <>
            <Button asChild variant="outline">
              <Link to="/reservations/new">
                <Plus className="mr-2 h-4 w-4" /> Réserver
              </Link>
            </Button>
            {isAdmin && (
              <Button asChild>
                <Link to="/resources/new">
                  <Plus className="mr-2 h-4 w-4" /> Nouvelle ressource
                </Link>
              </Button>
            )}
          </>
        }
      />

      {isLoading && <SkeletonGrid />}
      {error && (
        <ErrorState message={error instanceof ApiError ? error.message : "Erreur de chargement"} />
      )}
      {data && data.length === 0 && (
        <EmptyState
          title="Aucune ressource"
          description={isAdmin ? "Commencez par créer une ressource." : "Aucune ressource n'est disponible."}
          action={
            isAdmin && (
              <Button asChild>
                <Link to="/resources/new">
                  <Plus className="mr-2 h-4 w-4" /> Créer une ressource
                </Link>
              </Button>
            )
          }
        />
      )}

      {sortedData.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedData.map((r) => {
            const reservable = canReserveRessource(r);
            return (
            <Card key={r.id} className="overflow-hidden">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {CATEGORY_LABELS[r.category]}
                    </div>
                    <h3 className="mt-1 text-lg font-semibold">{r.name}</h3>
                  </div>
                  <Badge variant={reservable ? "default" : "secondary"}>
                    {reservable ? "Disponible" : "Indisponible"}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Quantité disponible :{" "}
                  <span
                    className={
                      "font-medium " +
                      (r.availableQuantity > 0 ? "text-foreground" : "text-destructive")
                    }
                  >
                    {r.availableQuantity}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!reservable}
                    onClick={() =>
                      navigate({
                        to: "/reservations/new",
                        search: { ressourceId: r.id } as never,
                      })
                    }
                  >
                    Réserver
                  </Button>
                  {isAdmin && (
                    <>
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/resources/$id/edit" params={{ id: String(r.id) }}>
                          <Pencil className="mr-2 h-4 w-4" /> Modifier
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setToDelete(r)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette ressource ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {toDelete?.name} » sera définitivement supprimée. Cette action est irréversible.
            </AlertDialogDescription>
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

export function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-40 animate-pulse rounded-lg border border-border bg-card" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
      {message}
    </div>
  );
}
