import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/Protected";
import { ResourceForm } from "@/components/ResourceForm";

export const Route = createFileRoute("/resources/new")({
  ssr: false,
  head: () => ({ meta: [{ title: "Nouvelle ressource · ReservationSystem" }] }),
  component: () => (
    <Protected adminOnly>
      <ResourceForm />
    </Protected>
  ),
});
