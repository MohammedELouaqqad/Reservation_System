import { useEffect, useState } from "react";
import { auth, type AuthUser } from "@/lib/api";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setUser(auth.getUser());
    sync();
    setReady(true);
    window.addEventListener("rs-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("rs-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { user, ready, isAdmin: user?.role === "ADMIN" };
}
