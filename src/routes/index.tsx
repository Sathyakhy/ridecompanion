import { createFileRoute, Link } from "@tanstack/react-router";
import { Bike, Wrench, Fuel, BarChart3, BellRing, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MotoLog — Motorcycle Maintenance & Cost Tracker" },
      {
        name: "description",
        content:
          "Track motorcycle service history, mileage-based service schedules, fuel economy and running costs in one simple log.",
      },
      { property: "og:title", content: "MotoLog — Motorcycle Maintenance & Cost Tracker" },
      {
        property: "og:description",
        content: "Service history, mileage reminders, fuel economy and total cost of ownership for your bike.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Bike, title: "Bike profile", text: "Model, plate, VIN, purchase date and live odometer." },
  { icon: Wrench, title: "Maintenance log", text: "Every service with parts, labour and workshop details." },
  { icon: BellRing, title: "Service schedule", text: "Auto-calculated next-due km with good / due soon / overdue." },
  { icon: Fuel, title: "Fuel tracking", text: "km per litre, cost per km and monthly fuel spend." },
  { icon: Wallet, title: "Expense dashboard", text: "Monthly and yearly totals by category." },
  { icon: BarChart3, title: "Analytics", text: "Total cost of ownership, cost/km, priciest repairs." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Bike className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-semibold">MotoLog</span>
        </div>
        <Link to="/auth">
          <Button size="sm">Sign in</Button>
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-4 pt-10 pb-16 text-center">
        <p className="font-display text-xs uppercase tracking-[0.2em] text-primary">Vehicle logbook</p>
        <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-bold sm:text-5xl">
          Every service, litre and dollar your bike costs you.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          A focused maintenance logbook for riders: mileage-based service reminders, fuel economy, receipts and true
          cost per kilometre.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/auth">
            <Button size="lg">Start tracking</Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-4 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="panel p-5">
            <f.icon className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-base font-semibold">{f.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
