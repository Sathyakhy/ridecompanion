import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { auth } from "@/lib/firebase";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // 1. Check local rider session
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("motolog_user");
      if (stored) {
        try {
          const user = JSON.parse(stored);
          if (user?.id || user?.email) {
            return { user };
          }
        } catch {
          // ignore
        }
      }
    }

    // 2. Check Supabase active session
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        if (typeof window !== "undefined") {
          localStorage.setItem("motolog_user", JSON.stringify(data.session.user));
        }
        return { user: data.session.user };
      }
    } catch {
      // ignore
    }

    // 3. Check Firebase active session
    if (auth.currentUser) {
      const user = {
        id: auth.currentUser.uid,
        email: auth.currentUser.email,
        name: auth.currentUser.displayName,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("motolog_user", JSON.stringify(user));
      }
      return { user };
    }

    // If no session exists, redirect to /auth
    throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
