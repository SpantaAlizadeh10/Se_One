"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, User, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { validateAdminCredentials, setAdminSession } from "@/lib/admin-auth";
import { login } from "@/lib/api/auth";
import { setToken } from "@/lib/api/client";
import { ApiError } from "@/lib/api/client";
import { storeAuth } from "@/lib/auth-client";

export default function AdminLoginPage() {
  const { t, href } = useLanguage();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const apiConfigured = Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);

    try {
      if (validateAdminCredentials(username, password)) {
        setAdminSession();
        router.push(href("/admin"));
        return;
      }

      if (apiConfigured) {
        if (!username.includes("@")) {
          setError("Use your admin email address to sign in.");
          return;
        }
        const auth = await login(username, password);
        if (auth.user.role !== "admin") {
          setError("This account does not have admin access.");
          return;
        }
        setToken(auth.token);
        storeAuth(auth);
        setAdminSession();
        router.push(href("/admin"));
        return;
      }

      setError("Invalid username or password");
    } catch (err) {
      // Keep the local demo usable when the configured backend is offline.
      // Authentication errors from a reachable backend must still be shown.
      if (
        !(err instanceof ApiError) &&
        validateAdminCredentials(username, password)
      ) {
        setAdminSession();
        router.push(href("/admin"));
        return;
      }
      const message =
        err instanceof ApiError
          ? err.message
          : "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage/20 to-blue/20 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} className="text-danger" />
            </div>
            <h1 className="font-serif text-[28px] font-semibold text-ink mb-2">
              Admin Dashboard
            </h1>
            <p className="text-ink70 text-[14px]">
              Enter your credentials to access the admin panel
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 bg-danger/10 text-danger text-[13px] font-semibold rounded-xl px-4 py-3 mb-6">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-[13px] font-bold text-ink mb-2">
                Username
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-12 pr-4 py-3 border border-line rounded-xl bg-cream outline-none focus:border-blue transition-colors text-[15px]"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-[13px] font-bold text-ink mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-12 pr-4 py-3 border border-line rounded-xl bg-cream outline-none focus:border-blue transition-colors text-[15px]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-danger text-white rounded-xl py-4 text-[15px] font-bold hover:bg-danger/90 transition-colors disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-line text-center">
            <p className="text-[12px] text-muted">
              For demo purposes: username:{" "}
              <span className="font-mono font-bold">admin</span>, password:{" "}
              <span className="font-mono font-bold">seone2024</span>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <a
            href={href("/")}
            className="text-[13px] text-ink70 hover:text-blue"
          >
            ← Back to website
          </a>
        </div>
      </div>
    </div>
  );
}
