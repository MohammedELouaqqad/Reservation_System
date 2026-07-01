import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { api, ApiError, type Ressource } from "@/lib/api";

type Category = Ressource["category"];
type Status = Ressource["status"];

export function ResourceForm({ id }: { id?: number }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const editing = typeof id === "number";

  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("SPACE");
  const [status, setStatus] = useState<Status>("FREE");
  const [availableQuantity, setQty] = useState<number>(1);

  const existing = useQuery({
    queryKey: ["ressource", id],
    queryFn: () => api.getRessource(id!),
    enabled: editing,
  });

  useEffect(() => {
    if (existing.data) {
      setName(existing.data.name);
      setCategory(existing.data.category);
      setStatus(existing.data.status);
      setQty(existing.data.availableQuantity);
    }
  }, [existing.data]);

  const save = useMutation({
    mutationFn: async () => {
      const body = { name, category, status, availableQuantity };
      return editing
        ? api.updateRessource(id!, body)
        : api.createRessource(body);
    },
    onSuccess: () => {
      toast.success(editing ? "Ressource mise à jour" : "Ressource créée");
      qc.invalidateQueries({ queryKey: ["ressources"] });
      navigate({ to: "/resources" });
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Erreur lors de l'enregistrement"),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Le nom est requis");
    if (availableQuantity < 0) return toast.error("La quantité doit être positive");
    save.mutate();
  };

  return (
    <>
      <PageHeader
        title={editing ? "Modifier la ressource" : "Nouvelle ressource"}
        description="Renseignez les informations de la ressource"
      />
      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Salle A"
                required
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SPACE">Espace</SelectItem>
                    <SelectItem value="EQUIPMENT">Équipement</SelectItem>
                    <SelectItem value="IT_INFRASTRUCTURE">Infrastructure IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">Libre</SelectItem>
                    <SelectItem value="BUSY">Occupée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qty">Quantité disponible</Label>
              <Input
                id="qty"
                type="number"
                min={0}
                value={availableQuantity}
                onChange={(e) => setQty(Number(e.target.value))}
                required
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Enregistrement…" : "Enregistrer"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/resources" })}
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
