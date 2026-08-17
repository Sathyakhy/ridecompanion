import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Bike = {
  id: string;
  name: string;
  model: string | null;
  plate_number: string | null;
  year: number | null;
  vin: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  current_odometer: number;
  photo_path: string | null;
};

const STORAGE_KEY = "motolog.activeBike";

export function useBikes() {
  return useQuery({
    queryKey: ["bikes"],
    queryFn: async (): Promise<Bike[]> => {
      const { data, error } = await supabase
        .from("bikes")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Bike[];
    },
  });
}

export function useActiveBike() {
  const { data: bikes, isLoading } = useBikes();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored) setActiveId(stored);
  }, []);

  const list = bikes ?? [];
  const resolvedId = list.some((b) => b.id === activeId) ? activeId : (list[0]?.id ?? null);
  const bike = list.find((b) => b.id === resolvedId) ?? null;

  const selectBike = (id: string) => {
    window.localStorage.setItem(STORAGE_KEY, id);
    setActiveId(id);
  };

  return { bikes: list, bike, bikeId: resolvedId, selectBike, isLoading };
}
