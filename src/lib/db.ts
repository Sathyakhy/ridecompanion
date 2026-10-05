import { supabase } from "@/integrations/supabase/client";
import { auth } from "@/lib/firebase";

export async function currentUserId(): Promise<string> {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("motolog_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.id) return parsed.id;
      } catch {
        // ignore json error
      }
    }
  }

  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user?.id) {
      return data.session.user.id;
    }
  } catch {
    // ignore
  }

  if (auth.currentUser?.uid) {
    return auth.currentUser.uid;
  }

  return "demo_rider_default";
}

export function num(value: string | number | null | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
