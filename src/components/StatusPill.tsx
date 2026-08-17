import { type ServiceStatus, statusLabel } from "@/lib/moto";

const styles: Record<ServiceStatus, string> = {
  good: "bg-success/15 text-success border-success/30",
  "due-soon": "bg-warning/15 text-warning border-warning/30",
  overdue: "bg-destructive/15 text-destructive border-destructive/30",
};

const dot: Record<ServiceStatus, string> = {
  good: "✅",
  "due-soon": "⚠️",
  overdue: "🔴",
};

export function StatusPill({ status }: { status: ServiceStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      <span aria-hidden>{dot[status]}</span>
      {statusLabel[status]}
    </span>
  );
}
