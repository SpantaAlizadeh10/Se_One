"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clock3, Users, Plus, CheckCircle2 } from "lucide-react";

const defaultSlot = {
  title: "",
  description: "",
  teacherRole: "all",
  capacity: 10,
  startsAt: "",
  endsAt: "",
};

export default function ClassScheduler() {
  const [slot, setSlot] = useState(defaultSlot);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [slots, setSlots] = useState<any[]>([
    {
      id: "slot-1",
      title: "Conversation Club",
      description: "Small-group speaking practice",
      teacherRole: "all",
      capacity: 10,
      startsAt: "2026-10-15T10:00",
      endsAt: "2026-10-15T11:00",
      teacherName: "Admin Team",
      remainingSeats: 7,
    },
  ]);

  const totalSeats = useMemo(
    () => slots.reduce((sum, item) => sum + (item.capacity ?? 0), 0),
    [slots],
  );

  const handleChange = (
    field: keyof typeof defaultSlot,
    value: string | number,
  ) => {
    setSlot((current) => ({ ...current, [field]: value }));
  };

  const handleCreate = async () => {
    setSaving(true);
    setMessage("");

    try {
      if (!slot.title || !slot.startsAt || !slot.endsAt) {
        throw new Error("Title, start time, and end time are required.");
      }

      const nextSlot = {
        ...slot,
        id: crypto.randomUUID(),
        teacherName: "Admin Team",
        remainingSeats: slot.capacity,
      };

      setSlots((current) => [nextSlot, ...current]);
      setSlot(defaultSlot);
      setMessage("Class slot created successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not create class slot.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-blue/10 p-2 text-blue">
            <CalendarDays size={18} />
          </div>
          <div>
            <h2 className="font-serif text-[22px] font-semibold">
              Create public class slot
            </h2>
            <p className="text-[13px] text-muted">
              Only admin creates these slots; teachers choose from them.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-[13px] text-muted">
            <span>Title</span>
            <input
              value={slot.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full rounded-xl border border-line bg-cream px-3.5 py-3 outline-none focus:border-blue"
              placeholder="Conversation Club"
            />
          </label>

          <label className="space-y-2 text-[13px] text-muted">
            <span>Teacher role</span>
            <select
              value={slot.teacherRole}
              onChange={(e) => handleChange("teacherRole", e.target.value)}
              className="w-full rounded-xl border border-line bg-cream px-3.5 py-3 outline-none focus:border-blue"
            >
              <option value="all">All teachers</option>
              <option value="english">English</option>
              <option value="math">Math</option>
            </select>
          </label>

          <label className="space-y-2 text-[13px] text-muted">
            <span>Start date & time</span>
            <input
              type="datetime-local"
              value={slot.startsAt}
              onChange={(e) => handleChange("startsAt", e.target.value)}
              className="w-full rounded-xl border border-line bg-cream px-3.5 py-3 outline-none focus:border-blue"
            />
          </label>

          <label className="space-y-2 text-[13px] text-muted">
            <span>End date & time</span>
            <input
              type="datetime-local"
              value={slot.endsAt}
              onChange={(e) => handleChange("endsAt", e.target.value)}
              className="w-full rounded-xl border border-line bg-cream px-3.5 py-3 outline-none focus:border-blue"
            />
          </label>

          <label className="space-y-2 text-[13px] text-muted md:col-span-2">
            <span>Description</span>
            <textarea
              value={slot.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="min-h-[120px] w-full rounded-xl border border-line bg-cream px-3.5 py-3 outline-none focus:border-blue"
              placeholder="Class description"
            />
          </label>

          <label className="space-y-2 text-[13px] text-muted">
            <span>Capacity</span>
            <input
              type="number"
              value={slot.capacity}
              min={1}
              max={10}
              onChange={(e) => handleChange("capacity", Number(e.target.value))}
              className="w-full rounded-xl border border-line bg-cream px-3.5 py-3 outline-none focus:border-blue"
            />
          </label>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={handleCreate}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-70"
          >
            <Plus size={16} />
            {saving ? "Saving..." : "Create slot"}
          </button>

          <div className="text-[12px] text-muted">
            Total capacity:{" "}
            <span className="font-semibold text-ink">{totalSeats}</span>
          </div>
        </div>

        {message && (
          <div className="mt-4 rounded-xl border border-success/25 bg-success/10 px-3 py-2 text-[12px] text-success">
            {message}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-sage/20 p-2 text-sageDeep">
            <Users size={18} />
          </div>
          <div>
            <h3 className="font-serif text-[20px] font-semibold">
              Available class slots
            </h3>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {slots.map((slotItem) => (
            <div
              key={slotItem.id}
              className="rounded-2xl border border-line bg-cream p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-ink">{slotItem.title}</h4>
                  <p className="text-[12px] text-muted">
                    {slotItem.teacherName}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[11px] font-medium text-success">
                  <CheckCircle2 size={12} />
                  {slotItem.remainingSeats > 0 ? "Open" : "Full"}
                </span>
              </div>

              <p className="mb-3 text-[12.5px] text-muted">
                {slotItem.description}
              </p>

              <div className="space-y-2 text-[12.5px] text-muted">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} />
                  <span>{slotItem.startsAt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 size={14} />
                  <span>{slotItem.endsAt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} />
                  <span>{slotItem.remainingSeats} seats left</span>
                </div>
              </div>

              <button className="mt-4 w-full rounded-xl bg-blue px-3.5 py-2.5 text-[13px] font-medium text-white">
                Select this class
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
