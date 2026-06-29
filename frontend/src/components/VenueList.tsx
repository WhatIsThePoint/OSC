import { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { Venue } from "../lib/types";
import VenueCalendar from "./VenueCalendar";

type Props = {
  venues: Venue[];
  loading: boolean;
  error: string | null;
  onChanged: () => void;
};

export default function VenueList({ venues, loading, error, onChanged }: Props) {
  const { user } = useAuth();
  const [openId, setOpenId] = useState<string | null>(null);

  async function remove(id: string) {
    try {
      await api(`/venues/${id}`, { method: "DELETE" });
      onChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Loading venues…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (venues.length === 0) return <p className="text-sm text-gray-500">No venues match.</p>;

  return (
    <div className="space-y-3">
      {venues.map((v) => {
        const open = openId === v.id;
        return (
          <div key={v.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <button
              onClick={() => setOpenId(open ? null : v.id)}
              className="flex w-full items-start justify-between text-left"
            >
              <span>
                <span className="font-semibold text-gray-900">{v.name}</span>
                <span className="ml-2 text-xs text-gray-400">{open ? "▲ hide" : "▼ calendar"}</span>
                <span className="mt-1 block text-sm text-gray-500">{v.address}</span>
              </span>
              <span className="text-sm font-medium text-blue-600">${v.pricePerHour}/hr</span>
            </button>

            <div className="mt-2 flex flex-wrap gap-1">
              {v.sportTypes.map((s) => (
                <span key={s} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                  {s}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">Capacity: {v.capacity}</p>

            {user?.id === v.ownerId && (
              <button
                onClick={() => remove(v.id)}
                className="mt-3 rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                Delete
              </button>
            )}

            {open && <VenueCalendar venueId={v.id} />}
          </div>
        );
      })}
    </div>
  );
}
