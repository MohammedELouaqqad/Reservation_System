import type { Ressource } from "@/lib/api";

export function canReserveRessource(r: Ressource): boolean {
  return r.status === "FREE" && r.availableQuantity > 0;
}

export function sortRessources(items: Ressource[]): Ressource[] {
  return [...items].sort((a, b) => {
    const aAvailable = canReserveRessource(a);
    const bAvailable = canReserveRessource(b);
    if (aAvailable !== bAvailable) {
      return aAvailable ? -1 : 1;
    }
    return a.name.localeCompare(b.name, "fr");
  });
}
