"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Incorrect password");
        setPassword("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-snow">
      <div className="w-full max-w-sm mx-4">
        <div className="bg-white rounded-lg border border-alabaster p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-carbon">
              Image Processor
            </h1>
            <p className="text-sm text-slate mt-1">
              Enter password to continue
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoFocus
                required
                className="w-full px-3 py-2 text-sm border border-alabaster rounded-md focus:outline-none focus:ring-2 focus:ring-iron focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 mb-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-2 text-sm font-medium text-white bg-carbon rounded-md hover:bg-gunmetal disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
