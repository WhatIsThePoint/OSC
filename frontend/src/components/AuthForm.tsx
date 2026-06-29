import { useState, type FormEvent } from "react";
import { useAuth } from "../lib/auth";

export default function AuthForm() {
  const { user, login, register, logout } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"PLAYER" | "OWNER">("OWNER");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
        <div className="text-sm">
          <span className="font-medium text-gray-900">{user.email}</span>
          <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {user.role}
          </span>
          <span className="ml-2 text-gray-500">
            Wallet: <span className="font-medium">${Number(user.walletBalance).toFixed(2)}</span>
          </span>
        </div>
        <button
          onClick={logout}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
        >
          Log out
        </button>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-gray-200 bg-white p-4"
    >
      <div className="mb-3 flex gap-2">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${
              mode === m ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <input
          type="email"
          required
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="password (min 6)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {mode === "register" && (
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "PLAYER" | "OWNER")}
          className="mt-2 rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="OWNER">OWNER</option>
          <option value="PLAYER">PLAYER</option>
        </select>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <button
        disabled={busy}
        className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {busy ? "..." : mode === "login" ? "Log in" : "Create account"}
      </button>
    </form>
  );
}
