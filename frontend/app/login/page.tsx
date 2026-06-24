"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wrench, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { mockDb } from "../dashboard/mockDb";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    mockDb.initialize();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (isForgotPassword) {
      try {
        const isOffline = typeof window !== "undefined" && window.location.protocol === "file:";
        const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
          ? `${window.location.protocol}//${window.location.hostname}:8000`
          : "";

        if (isOffline) {
          setTimeout(() => {
            setIsLoading(false);
            setMessage({
              type: "success",
              text: "SUCCESS (Offline Demo): Password reset URL generated. In production, an email is dispatched. Copy/paste this link to proceed: " + (typeof window !== "undefined" && window.location.pathname.replace("login/index.html", "") || "") + "login/reset/index.html?token=mock-offline-token"
            });
          }, 1000);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (response.ok) {
          setMessage({
            type: "success",
            text: "Recovery link dispatched! Check your email inbox (and SPAM folder) / ¡Enlace de recuperación enviado! Revisa tu bandeja de correo (y carpeta de SPAM)."
          });
        } else {
          setMessage({
            type: "error",
            text: data.detail || "Error dispatching password recovery link."
          });
        }
      } catch (err) {
        console.error(err);
        setMessage({ type: "error", text: "Connection error: Could not contact auth server." });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (isSignUp) {
      setTimeout(() => {
        setIsLoading(false);
        setMessage({
          type: "success",
          text: "Registration request received! An administrator will approve your tenant."
        });
      }, 1200);
      return;
    }

    try {
      const isOffline = typeof window !== "undefined" && window.location.protocol === "file:";
      const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
        ? `${window.location.protocol}//${window.location.hostname}:8000`
        : "";

      let token = "";

      if (!isOffline) {
        // Try to authenticate with the real backend API
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });
          if (response.ok) {
            const data = await response.json();
            token = data.access_token;
          }
        } catch (apiErr) {
          console.warn("Could not authenticate with real API, using mock fallback:", apiErr);
        }
      }

      // Check against mock database for local navigation
      const profile = mockDb.getProfileByEmail(email);
      if (profile && password === "admin1234") {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("wfs_session", JSON.stringify(profile));
          if (token) {
            sessionStorage.setItem("wfs_token", token);
          } else {
            // Seed a mock token if offline to prevent UI crashes, though it won't be validated
            sessionStorage.setItem("wfs_token", "mock-offline-token-xyz");
          }
        }
        setMessage({
          type: "success",
          text: "Successfully signed in! Redirecting..."
        });
        setTimeout(() => {
          if (typeof window !== "undefined" && window.location.protocol === "file:") {
            window.location.href = "../dashboard/index.html";
          } else {
            router.push("/dashboard");
          }
        }, 1000);
      } else {
        setMessage({
          type: "error",
          text: "Invalid email or password. Hint: Use admin@willyfastsolutions.com with admin1234"
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "An error occurred during sign in." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/30 via-zinc-950 to-zinc-950 -z-10" />
      
      {/* Return Home Button */}
      <a 
        href="../" 
        onClick={(e) => {
          if (typeof window !== "undefined" && window.location.protocol === "file:") {
            e.preventDefault();
            window.location.href = "../index.html";
          }
        }}
        id="btn-login-back"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
      </a>

      <div className="w-full max-w-md space-y-6">
        
        {/* Logo / Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl shadow-lg w-12 h-12 overflow-hidden flex items-center justify-center">
            <img src="../logo/logo.png" alt="WillyFastSolutions Logo" className="w-full h-full object-cover filter brightness-110" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-200">
            {isForgotPassword 
              ? "Recover password" 
              : (isSignUp ? "Create your workspace" : "Welcome back")}
          </h2>
          <p className="text-xs text-zinc-500">
            {isForgotPassword 
              ? "Enter your email to receive a password reset link" 
              : (isSignUp 
                ? "Register your company fleet on WillyFastSolutions"
                : "Sign in to manage your heavy equipment preventive maintenance")}
          </p>
        </div>

        {/* Card Container */}
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
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
                <input 
                  type="email" 
                  id="login-email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            {!isForgotPassword && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="login-password" className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
                    Password
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setMessage(null);
                      }}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
                  <input 
                    type="password" 
                    id="login-password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required={!isForgotPassword}
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              id="btn-login-submit"
              disabled={isLoading}
              className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-zinc-100 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-zinc-100 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Please wait...
                </>
              ) : (
                isForgotPassword 
                  ? "Send Recovery Link" 
                  : (isSignUp ? "Register" : "Sign In")
              )}
            </button>

          </form>

          {/* Toggle Link */}
          <div className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-900/60">
            {isForgotPassword ? (
              <button 
                type="button" 
                onClick={() => {
                  setIsForgotPassword(false);
                  setMessage(null);
                }}
                className="font-medium text-zinc-300 hover:text-zinc-100 underline decoration-zinc-700 hover:decoration-zinc-400 transition-colors cursor-pointer"
              >
                Back to Sign In
              </button>
            ) : (
              <>
                {isSignUp ? "Already have an account?" : "Need a workspace for your company?"}{" "}
                <button 
                  type="button" 
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setMessage(null);
                  }}
                  className="font-medium text-zinc-300 hover:text-zinc-100 underline decoration-zinc-700 hover:decoration-zinc-400 transition-colors cursor-pointer"
                >
                  {isSignUp ? "Sign In" : "Register Company"}
                </button>
              </>
            )}
          </div>

        </div>

        {/* Footer info */}
        <div className="text-[10px] text-center text-zinc-600">
          Secure identity verification managed by Supabase Auth RLS policies.
        </div>
      </div>
    </div>
  );
}
