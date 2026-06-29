import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./lib/api";
import { useAuth } from "./lib/auth";
import type { Venue, VenueFilters } from "./lib/types";
import AuthForm from "./components/AuthForm";
import Filters from "./components/Filters";
import VenueForm from "./components/VenueForm";
import VenueList from "./components/VenueList";

const KNOWN_SPORTS = ["FUTSAL", "BASKETBALL", "TENNIS", "FOOTBALL", "VOLLEYBALL"];

export default function App() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<VenueFilters>({});
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (filters.sport) p.set("sport", filters.sport);
    if (filters.maxPrice) p.set("maxPrice", filters.maxPrice);
    if (filters.openToday) p.set("openToday", "true");
    const s = p.toString();
    return s ? `?${s}` : "";
  }, [filters]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setVenues(await api<Venue[]>(`/venues${query}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load venues");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  // Sport options = known list plus anything already present on venues.
  const sports = useMemo(() => {
    const set = new Set(KNOWN_SPORTS);
    venues.forEach((v) => v.sportTypes.forEach((s) => set.add(s)));
    return [...set].sort();
  }, [venues]);

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Venue Booking</h1>

      <AuthForm />

      {user && <VenueForm onCreated={load} />}

      <Filters filters={filters} sports={sports} onChange={setFilters} />

      <VenueList venues={venues} loading={loading} error={error} onChanged={load} />
    </div>
  );
}
