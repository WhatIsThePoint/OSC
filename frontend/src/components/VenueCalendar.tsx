import { useEffect, useMemo, useState } from "react";
import { getVenueSlots } from "../lib/api";
import type { Slot, SlotStatus } from "../lib/types";

const STATUS_STYLES: Record<SlotStatus, string> = {
  AVAILABLE: "bg-green-100 text-green-800 ring-1 ring-green-300 cursor-pointer hover:bg-green-200",
  HELD: "bg-amber-100 text-amber-800 ring-1 ring-amber-300",
  BOOKED: "bg-gray-200 text-gray-600",
  EXPIRED: "bg-gray-50 text-gray-400 line-through",
  COMPLETED: "bg-slate-700 text-slate-100",
};

const DAY_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfToday() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

export default function VenueCalendar({ venueId }: { venueId: string }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getVenueSlots(venueId)
      .then((s) => active && setSlots(s))
      .catch((e) => active && setError(e instanceof Error ? e.message : "Failed to load slots"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [venueId]);

  const today = startOfToday();

  // 7 day columns starting today.
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return d;
      }),
    [today]
  );

  // Index slots by "dayOffset-hour"; derive the hour range from the data.
  const { byCell, hours } = useMemo(() => {
    const map = new Map<string, Slot>();
    let min = 23;
    let max = 0;
    for (const s of slots) {
      const start = new Date(s.startTime);
      const dayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const offset = Math.round((dayStart.getTime() - today.getTime()) / 86_400_000);
      if (offset < 0 || offset > 6) continue;
      const hour = start.getHours();
      map.set(`${offset}-${hour}`, s);
      min = Math.min(min, hour);
      max = Math.max(max, hour);
    }
    const hrs = min <= max ? Array.from({ length: max - min + 1 }, (_, i) => min + i) : [];
    return { byCell: map, hours: hrs };
  }, [slots, today]);

  if (loading) return <p className="mt-3 text-sm text-gray-500">Loading availability…</p>;
  if (error) return <p className="mt-3 text-sm text-red-600">{error}</p>;
  if (slots.length === 0)
    return <p className="mt-3 text-sm text-gray-500">No availability for the next 7 days.</p>;

  return (
    <div className="mt-3 overflow-x-auto">
      <div className="min-w-[640px]">
        {/* header row */}
        <div className="grid grid-cols-[56px_repeat(7,1fr)] gap-1">
          <div />
          {days.map((d) => (
            <div key={d.toISOString()} className="text-center text-xs font-medium text-gray-600">
              {DAY_LABEL[d.getDay()]}
              <div className="text-[10px] text-gray-400">
                {d.getMonth() + 1}/{d.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* hour rows */}
        {hours.map((h) => (
          <div key={h} className="mt-1 grid grid-cols-[56px_repeat(7,1fr)] gap-1">
            <div className="flex items-center justify-end pr-1 text-[10px] text-gray-400">
              {String(h).padStart(2, "0")}:00
            </div>
            {days.map((_, offset) => {
              const slot = byCell.get(`${offset}-${h}`);
              if (!slot) return <div key={offset} className="h-7 rounded bg-transparent" />;
              return (
                <div
                  key={offset}
                  title={`${slot.status} · ${new Date(slot.startTime).toLocaleString()}`}
                  className={`flex h-7 items-center justify-center rounded text-[10px] font-medium ${STATUS_STYLES[slot.status]}`}
                >
                  {slot.status[0]}
                </div>
              );
            })}
          </div>
        ))}

        {/* legend */}
        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-gray-600">
          {(Object.keys(STATUS_STYLES) as SlotStatus[]).map((s) => (
            <span key={s} className="flex items-center gap-1">
              <span className={`inline-block h-3 w-3 rounded ${STATUS_STYLES[s].split(" ")[0]}`} />
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
