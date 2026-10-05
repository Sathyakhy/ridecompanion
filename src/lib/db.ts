import { supabase } from "@/integrations/supabase/client";
import { auth } from "@/lib/firebase";

export async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (data?.user?.id) {
    return data.user.id;
  }
  if (auth.currentUser?.uid) {
    return auth.currentUser.uid;
  }
  throw new Error("Not signed in");
}

export function num(value: string | number | null | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
