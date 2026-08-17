import { type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bike as BikeIcon,
  Wrench,
  CalendarClock,
  Fuel,
  Wallet,
  BellRing,
  BarChart3,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useActiveBike } from "@/hooks/useBikes";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/garage", label: "Garage", icon: BikeIcon },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/schedule", label: "Schedule", icon: CalendarClock },
  { to: "/fuel", label: "Fuel", icon: Fuel },
  { to: "/expenses", label: "Expenses", icon: Wallet },
  { to: "/reminders", label: "Reminders", icon: BellRing },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export function AppShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { bikes, bikeId, selectBike } = useActiveBike();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BikeIcon className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-semibold">MotoLog</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {bikes.length > 0 && (
              <Select value={bikeId ?? ""} onValueChange={selectBike}>
                <SelectTrigger className="h-9 w-[9.5rem] text-sm">
                  <SelectValue placeholder="Select bike" />
                </SelectTrigger>
                <SelectContent>
                  {bikes.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-2">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {action}
        </div>
        {children}
      </main>
    </div>
  );
}

export function EmptyGarage() {
  return (
    <div className="panel p-10 text-center">
      <BikeIcon className="mx-auto h-8 w-8 text-muted-foreground" />
      <h2 className="mt-3 text-lg font-semibold">No vehicle yet</h2>
      <p className="mt-1 text-sm text-muted-foreground">Add your bike profile to start tracking.</p>
      <Link to="/garage" className="mt-4 inline-block">
        <Button>Add a bike</Button>
      </Link>
    </div>
  );
}
