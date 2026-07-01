import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  ssr: false,
  component: () => {
    if (typeof window === "undefined") return null;
    const token = window.localStorage.getItem("rs_token");
    return <Navigate to={token ? "/dashboard" : "/login"} replace />;
  },
});
