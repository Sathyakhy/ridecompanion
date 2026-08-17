import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { currentUserId, num } from "@/lib/db";
import { useActiveBike, type Bike } from "@/hooks/useBikes";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, km, money, DEFAULT_SCHEDULE_ITEMS } from "@/lib/moto";

export const Route = createFileRoute("/_authenticated/garage")({
  head: () => ({
    meta: [
      { title: "Garage — MotoLog" },
      { name: "description", content: "Manage your motorcycle profiles: model, plate, VIN, odometer and photo." },
      { property: "og:title", content: "Garage — MotoLog" },
      { property: "og:description", content: "Manage your motorcycle profiles and odometer readings." },
    ],
  }),
  component: GaragePage,
});

const EMPTY = {
  name: "",
  model: "",
  plate_number: "",
  year: "",
  vin: "",
  purchase_date: "",
  purchase_price: "",
  current_odometer: "",
};

function GaragePage() {
  const { bikes, bike, selectBike } = useActiveBike();
  const qc = useQueryClient();
  const [form, setForm] = useState({ ...EMPTY });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setPhotoUrl(null);
    if (bike?.photo_path) {
      supabase.storage
        .from("vehicle-files")
        .createSignedUrl(bike.photo_path, 3600)
        .then(({ data }) => {
          if (active) setPhotoUrl(data?.signedUrl ?? null);
        });
    }
    return () => {
      active = false;
    };
  }, [bike?.photo_path]);

  const save = useMutation({
    mutationFn: async () => {
      const user_id = await currentUserId();
      const payload = {
        user_id,
        name: form.name,
        model: form.model || null,
        plate_number: form.plate_number || null,
        year: form.year ? num(form.year) : null,
        vin: form.vin || null,
        purchase_date: form.purchase_date || null,
        purchase_price: form.purchase_price ? num(form.purchase_price) : null,
        current_odometer: num(form.current_odometer),
      };
      if (editingId) {
        const { error } = await supabase.from("bikes").update(payload).eq("id", editingId);
        if (error) throw error;
        return editingId;
      }
      const { data, error } = await supabase.from("bikes").insert(payload).select("id").single();
      if (error) throw error;
      const newId = (data as { id: string }).id;
      const { error: schedErr } = await supabase.from("service_schedules").insert(
        DEFAULT_SCHEDULE_ITEMS.map((s) => ({
          user_id,
          bike_id: newId,
          item: s.item,
          interval_km: s.interval_km,
          last_service_odometer: num(form.current_odometer),
          last_service_date: new Date().toISOString().slice(0, 10),
        })),
      );
      if (schedErr) throw schedErr;
      return newId;
    },
    onSuccess: (id) => {
      qc.invalidateQueries();
      setForm({ ...EMPTY });
      setEditingId(null);
      selectBike(id);
      toast.success("Bike saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bikes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Bike deleted");
    },
  });

  const uploadPhoto = async (file: File, bikeId: string) => {
    const user_id = await currentUserId();
    const path = `${user_id}/bikes/${bikeId}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("vehicle-files").upload(path, file);
    if (error) {
      toast.error(error.message);
      return;
    }
    await supabase.from("bikes").update({ photo_path: path }).eq("id", bikeId);
    qc.invalidateQueries({ queryKey: ["bikes"] });
    toast.success("Photo updated");
  };

  const startEdit = (b: Bike) => {
    setEditingId(b.id);
    setForm({
      name: b.name,
      model: b.model ?? "",
      plate_number: b.plate_number ?? "",
      year: b.year ? String(b.year) : "",
      vin: b.vin ?? "",
      purchase_date: b.purchase_date ?? "",
      purchase_price: b.purchase_price ? String(b.purchase_price) : "",
      current_odometer: String(b.current_odometer ?? 0),
    });
  };

  return (
    <AppShell title="Garage" subtitle="Your vehicle profiles and odometer readings.">
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          {bikes.length === 0 && (
            <div className="panel p-8 text-center text-sm text-muted-foreground">
              No vehicle yet — add your first bike using the form.
            </div>
          )}
          {bikes.map((b) => (
            <div key={b.id} className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{b.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {[b.model, b.plate_number, b.year].filter(Boolean).join(" · ") || "No details yet"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => startEdit(b)}>
                    Edit
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove.mutate(b.id)} aria-label="Delete bike">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-muted-foreground">Odometer</dt>
                  <dd className="stat-figure">{km(b.current_odometer)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Purchased</dt>
                  <dd>{formatDate(b.purchase_date)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Price</dt>
                  <dd>{b.purchase_price ? money(b.purchase_price) : "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">VIN</dt>
                  <dd className="truncate">{b.vin || "—"}</dd>
                </div>
              </dl>
              {bike?.id === b.id && photoUrl && (
                <img src={photoUrl} alt={`${b.name} photo`} className="mt-4 max-h-56 w-full rounded-lg object-cover" />
              )}
              <div className="mt-4">
                <Label htmlFor={`photo-${b.id}`} className="text-xs text-muted-foreground">
                  Bike photo
                </Label>
                <Input
                  id={`photo-${b.id}`}
                  type="file"
                  accept="image/*"
                  className="mt-1"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadPhoto(f, b.id);
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <form
          className="panel h-fit space-y-3 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <h2 className="text-base font-semibold">{editingId ? "Edit bike" : "Add a bike"}</h2>
          <Field label="Name / model" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Field label="Model detail" value={form.model} onChange={(v) => setForm({ ...form, model: v })} />
          <Field label="License plate" value={form.plate_number} onChange={(v) => setForm({ ...form, plate_number: v })} />
          <Field label="Year" type="number" value={form.year} onChange={(v) => setForm({ ...form, year: v })} />
          <Field label="VIN / chassis" value={form.vin} onChange={(v) => setForm({ ...form, vin: v })} />
          <Field
            label="Purchase date"
            type="date"
            value={form.purchase_date}
            onChange={(v) => setForm({ ...form, purchase_date: v })}
          />
          <Field
            label="Purchase price"
            type="number"
            value={form.purchase_price}
            onChange={(v) => setForm({ ...form, purchase_price: v })}
          />
          <Field
            label="Current odometer (km)"
            type="number"
            value={form.current_odometer}
            onChange={(v) => setForm({ ...form, current_odometer: v })}
          />
          <div className="flex gap-2 pt-1">
            <Button type="submit" className="flex-1" disabled={save.isPending}>
              {editingId ? "Save changes" : "Add bike"}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingId(null);
                  setForm({ ...EMPTY });
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
