import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/Protected";
import { ResourceForm } from "@/components/ResourceForm";

export const Route = createFileRoute("/resources/$id/edit")({
  ssr: false,
  head: () => ({ meta: [{ title: "Modifier la ressource · ReservationSystem" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <Protected adminOnly>
        <ResourceForm id={Number(id)} />
      </Protected>
    );
  },
});
