import { useState, type FormEvent } from "react";
import { api } from "../lib/api";

export default function VenueForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [sportTypes, setSportTypes] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [capacity, setCapacity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api("/venues", {
        method: "POST",
        body: {
          name,
          address,
          sportTypes: sportTypes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          pricePerHour: Number(pricePerHour),
          capacity: Number(capacity),
        },
      });
      setName("");
      setAddress("");
      setSportTypes("");
      setPricePerHour("");
      setCapacity("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  const input = "rounded-md border border-gray-300 px-3 py-2 text-sm";

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-3 font-semibold text-gray-900">Add a venue</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        <input className={input} required placeholder="name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={input} required placeholder="address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <input className={input} required placeholder="sports (comma separated)" value={sportTypes} onChange={(e) => setSportTypes(e.target.value)} />
        <input className={input} required type="number" min="1" step="0.01" placeholder="price/hour" value={pricePerHour} onChange={(e) => setPricePerHour(e.target.value)} />
        <input className={input} required type="number" min="1" placeholder="capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        disabled={busy}
        className="mt-3 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50"
      >
        {busy ? "..." : "Create venue"}
      </button>
    </form>
  );
}
