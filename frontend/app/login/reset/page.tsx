"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowLeft, Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match / Las contraseñas no coinciden." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const isOffline = typeof window !== "undefined" && window.location.protocol === "file:";
    const isMockToken = token === "mock-offline-token" || !token;

    if (isOffline || isMockToken) {
      setTimeout(() => {
        setIsLoading(false);
        setMessage({
          type: "success",
          text: "SUCCESS (Offline Demo): Password reset successfully! Redirecting to login... / ¡Contraseña restablecida con éxito! Redirigiendo..."
        });
        setTimeout(() => {
          if (isOffline) {
            window.location.href = "../index.html";
          } else {
            router.push("/login");
          }
        }, 2000);
      }, 1200);
      return;
    }

    try {
      const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
        ? `${window.location.protocol}//${window.location.hostname}:8000`
        : "";

      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({
          type: "success",
          text: "Password updated successfully! Redirecting to login... / ¡Contraseña actualizada con éxito! Redirigiendo..."
        });
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: data.detail || "Invalid or expired token / Token inválido o vencido."
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Connection error: Could not contact auth server." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl shadow-lg w-12 h-12 overflow-hidden flex items-center justify-center">
          <img src="../../logo/logo.png" alt="WillyFastSolutions Logo" className="w-full h-full object-cover filter brightness-110" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-200">
          Reset password / Restablecer Contraseña
        </h2>
        <p className="text-xs text-zinc-500">
          Define a new password for your fleet operator account
        </p>
      </div>

      <div className="border border-zinc-900 bg-zinc-900/20 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
        {message && (
          <div className={`p-3 rounded-lg text-xs border ${
            message.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="new-pass" className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
              New Password / Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
              <input 
                type="password" 
                id="new-pass" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm-new-pass" className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
              Confirm Password / Confirmar Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
              <input 
                type="password" 
                id="confirm-new-pass" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-zinc-100 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-zinc-100 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Please wait...
              </>
            ) : (
              "Save Password / Guardar Contraseña"
            )}
          </button>
        </form>

        {!token && token !== "mock-offline-token" && (
          <div className="text-center text-xs text-rose-400 font-medium">
            Missing or invalid token. Please request another link. / Token inválido o ausente. Solicita otro enlace.
          </div>
        )}

        <div className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-900/60">
          <a href="../../login" className="font-medium text-zinc-300 hover:text-zinc-100 underline decoration-zinc-700 hover:decoration-zinc-400 transition-colors">
            Back to login / Volver al login
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/30 via-zinc-950 to-zinc-950 -z-10" />
      <Suspense fallback={
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          <span className="text-xs text-zinc-500">Loading recovery details...</span>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
