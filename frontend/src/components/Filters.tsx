import type { VenueFilters } from "../lib/types";

type Props = {
  filters: VenueFilters;
  sports: string[];
  onChange: (f: VenueFilters) => void;
};

export default function Filters({ filters, sports, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <label className="flex flex-col text-xs text-gray-600">
        Sport
        <select
          value={filters.sport ?? ""}
          onChange={(e) => onChange({ ...filters, sport: e.target.value || undefined })}
          className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        >
          <option value="">Any</option>
          {sports.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-xs text-gray-600">
        Max price
        <input
          type="number"
          min="0"
          value={filters.maxPrice ?? ""}
          onChange={(e) => onChange({ ...filters, maxPrice: e.target.value || undefined })}
          placeholder="any"
          className="mt-1 w-28 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={!!filters.openToday}
          onChange={(e) => onChange({ ...filters, openToday: e.target.checked })}
          className="h-4 w-4"
        />
        Open today
      </label>

      <button
        type="button"
        onClick={() => onChange({})}
        className="ml-auto rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
      >
        Clear
      </button>
    </div>
  );
}
