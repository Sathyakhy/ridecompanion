import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { auth } from "@/lib/firebase";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Check Supabase session first
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      return { user: data.user };
    }

    // Check Firebase auth session
    if (auth.currentUser) {
      return {
        user: {
          id: auth.currentUser.uid,
          email: auth.currentUser.email,
        },
      };
    }

    // If neither is authenticated, redirect to /auth
    throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
