import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Protected } from "@/components/Protected";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, ApiError } from "@/lib/api";
import { canReserveRessource, sortRessources } from "@/lib/resources";

const searchSchema = z.object({
  ressourceId: z.coerce.number().optional(),
});

export const Route = createFileRoute("/reservations/new")({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Nouvelle réservation · ReservationSystem" }] }),
  component: () => (
    <Protected>
      <NewReservationPage />
    </Protected>
  ),
});

function NewReservationPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const search = Route.useSearch();

  const ressources = useQuery({ queryKey: ["ressources"], queryFn: api.listRessources });
  const availableRessources = useMemo(
    () => sortRessources(ressources.data ?? []).filter(canReserveRessource),
    [ressources.data]
  );

  const [ressourceId, setRessourceId] = useState<string>(
    search.ressourceId ? String(search.ressourceId) : ""
  );
  const [quantity, setQuantity] = useState<number>(1);

  const create = useMutation({
    mutationFn: () =>
      api.createReservation({
        quantity,
        ressource: { id: Number(ressourceId) },
      }),
    onSuccess: () => {
      toast.success("Réservation créée");
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["ressources"] });
      navigate({ to: "/reservations" });
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Impossible de créer la réservation"),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ressourceId) return toast.error("Sélectionnez une ressource");
    if (!quantity || quantity <= 0) return toast.error("La quantité doit être supérieure à 0");
    create.mutate();
  };

  return (
    <>
      <PageHeader
        title="Nouvelle réservation"
        description="Choisissez une ressource et la quantité souhaitée"
      />
      <Card className="max-w-xl">
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label>Ressource</Label>
              <Select value={ressourceId} onValueChange={setRessourceId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      ressources.isLoading
                        ? "Chargement…"
                        : availableRessources.length === 0
                          ? "Aucune ressource disponible"
                          : "Choisir une ressource"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableRessources.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name} — dispo : {r.availableQuantity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qty">Quantité</Label>
              <Input
                id="qty"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={create.isPending || availableRessources.length === 0}
              >
                {create.isPending ? "Création…" : "Confirmer la réservation"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/reservations" })}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
