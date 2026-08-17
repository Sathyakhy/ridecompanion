import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MaintenanceRecord = {
  id: string;
  bike_id: string;
  service_date: string;
  odometer: number;
  categories: string[];
  workshop: string | null;
  notes: string | null;
  parts_cost: number;
  labor_cost: number;
};

export type ServiceSchedule = {
  id: string;
  bike_id: string;
  item: string;
  last_service_odometer: number;
  last_service_date: string | null;
  interval_km: number | null;
  interval_months: number | null;
};

export type FuelLog = {
  id: string;
  bike_id: string;
  fill_date: string;
  odometer: number;
  liters: number;
  cost: number;
  fuel_type: string | null;
};

export type Expense = {
  id: string;
  bike_id: string;
  expense_date: string;
  category: string;
  amount: number;
  note: string | null;
};

export type Reminder = {
  id: string;
  bike_id: string;
  title: string;
  reminder_type: string;
  due_odometer: number | null;
  due_date: string | null;
  done: boolean;
};

function useTable<T>(table: string, bikeId: string | null, orderColumn: string) {
  return useQuery({
    queryKey: [table, bikeId],
    enabled: !!bikeId,
    queryFn: async (): Promise<T[]> => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("bike_id", bikeId!)
        .order(orderColumn, { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as T[];
    },
  });
}

export const useMaintenance = (bikeId: string | null) =>
  useTable<MaintenanceRecord>("maintenance_records", bikeId, "service_date");
export const useSchedules = (bikeId: string | null) =>
  useTable<ServiceSchedule>("service_schedules", bikeId, "item");
export const useFuelLogs = (bikeId: string | null) => useTable<FuelLog>("fuel_logs", bikeId, "odometer");
export const useExpenses = (bikeId: string | null) => useTable<Expense>("expenses", bikeId, "expense_date");
export const useReminders = (bikeId: string | null) => useTable<Reminder>("reminders", bikeId, "created_at");
