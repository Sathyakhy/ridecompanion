export const SERVICE_CATEGORIES = [
  "Engine oil change",
  "Gear oil change",
  "Air filter replacement",
  "Spark plug replacement",
  "Brake pad replacement",
  "Brake fluid replacement",
  "Coolant replacement",
  "Battery replacement",
  "CVT/Belt replacement",
  "Tire replacement",
  "Chain & sprocket service",
  "General inspection",
] as const;

export const EXPENSE_CATEGORIES = [
  "fuel",
  "maintenance",
  "parking",
  "insurance",
  "road tax",
  "other",
] as const;

export const REMINDER_TYPES = [
  "oil change",
  "insurance renewal",
  "road tax renewal",
  "battery inspection",
  "tire inspection",
  "other",
] as const;

export const DEFAULT_SCHEDULE_ITEMS: { item: string; interval_km: number }[] = [
  { item: "Engine oil change", interval_km: 2000 },
  { item: "Gear oil change", interval_km: 6000 },
  { item: "Air filter replacement", interval_km: 6000 },
  { item: "Spark plug replacement", interval_km: 8000 },
  { item: "CVT/Belt replacement", interval_km: 20000 },
  { item: "Tire replacement", interval_km: 15000 },
];

export type ServiceStatus = "good" | "due-soon" | "overdue";

export function scheduleStatus(opts: {
  currentOdometer: number;
  lastServiceOdometer: number;
  intervalKm?: number | null;
  lastServiceDate?: string | null;
  intervalMonths?: number | null;
}): { status: ServiceStatus; dueAtKm: number | null; kmRemaining: number | null; dueDate: string | null; daysRemaining: number | null } {
  let status: ServiceStatus = "good";
  let dueAtKm: number | null = null;
  let kmRemaining: number | null = null;

  if (opts.intervalKm && opts.intervalKm > 0) {
    dueAtKm = Number(opts.lastServiceOdometer) + Number(opts.intervalKm);
    kmRemaining = dueAtKm - Number(opts.currentOdometer);
    if (kmRemaining <= 0) status = "overdue";
    else if (kmRemaining <= Math.max(200, Number(opts.intervalKm) * 0.15)) status = "due-soon";
  }

  let dueDate: string | null = null;
  let daysRemaining: number | null = null;
  if (opts.intervalMonths && opts.intervalMonths > 0 && opts.lastServiceDate) {
    const d = new Date(opts.lastServiceDate);
    d.setMonth(d.getMonth() + opts.intervalMonths);
    dueDate = d.toISOString().slice(0, 10);
    daysRemaining = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
    if (daysRemaining <= 0) status = "overdue";
    else if (daysRemaining <= 14 && status === "good") status = "due-soon";
  }

  return { status, dueAtKm, kmRemaining, dueDate, daysRemaining };
}

export const statusLabel: Record<ServiceStatus, string> = {
  good: "Good",
  "due-soon": "Due soon",
  overdue: "Overdue",
};

export function money(value: number | null | undefined): string {
  return `$${(Number(value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function km(value: number | null | undefined): string {
  return `${Math.round(Number(value) || 0).toLocaleString()} km`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export function monthKey(date: string): string {
  return date.slice(0, 7);
}
