"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  PlusCircle, 
  Wrench, 
  LogOut, 
  Menu, 
  X, 
  User,
  ShieldAlert,
  Building,
  ClipboardList,
  Settings
} from "lucide-react";
import { Profile, mockDb } from "./mockDb";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [logoPath, setLogoPath] = useState("/logo/logo.png");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.location.protocol === "file:") {
        const pathNormal = window.location.pathname.replace(/\\/g, "/").toLowerCase();
        if (
          pathNormal.includes("/dashboard/companies") || 
          pathNormal.includes("/dashboard/machinery") || 
          pathNormal.includes("/dashboard/maintenance")
        ) {
          setLogoPath("../../logo/logo.png");
        } else if (pathNormal.includes("/dashboard") || pathNormal.includes("/login")) {
          setLogoPath("../logo/logo.png");
        } else {
          setLogoPath("logo/logo.png");
        }
      } else {
        setLogoPath("/logo/logo.png");
      }
    }
  }, [pathname]);

  const redirectToLogin = () => {
    if (typeof window !== "undefined") {
      if (window.location.protocol === "file:") {
        window.location.href = window.location.href.replace(/\/dashboard\/.*/, "/login/index.html");
      } else {
        router.push("/login");
      }
    }
  };

  useEffect(() => {
    try {
      mockDb.initialize();
      if (typeof window !== "undefined") {
        let sessionStr = null;
        try {
          sessionStr = sessionStorage.getItem("wfs_session");
        } catch (e) {
          console.warn("sessionStorage read failed:", e);
        }
        
        if (!sessionStr) {
          redirectToLogin();
        } else {
          try {
            const profile = JSON.parse(sessionStr) as Profile;
            setUser(profile);
            if (profile.company_id) {
              const compId = profile.company_id;
              const comp = mockDb.getCompanyById(compId);
              if (comp) setCompanyName(comp.name);

              const isOffline = window.location.protocol === "file:";
              const API_BASE_URL = (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
                ? `${window.location.protocol}//${window.location.hostname}:8000`
                : "";

              if (!isOffline) {
                const token = sessionStorage.getItem("wfs_token");
                fetch(`${API_BASE_URL}/api/companies/${compId}`, {
                  headers: {
                    "Authorization": `Bearer ${token}`
                  }
                })
                .then(res => {
                  if (res.ok) return res.json();
                  throw new Error("Failed to fetch company details");
                })
                .then(data => {
                  if (data && data.name) {
                    setCompanyName(data.name);
                    try {
                      mockDb.addCompany(data);
                    } catch (e) {}
                  }
                })
                .catch(err => {
                  console.warn("Could not fetch company details from API in layout:", err);
                });
              }
            } else {
              setCompanyName("WillyFastSolutions (Superadmin)");
            }
          } catch (e) {
            console.error("Failed to parse session profile:", e);
            redirectToLogin();
            return;
          }
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Auth check failed in layout:", err);
      redirectToLogin();
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("wfs_session");
      redirectToLogin();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-200" />
          <p className="text-xs text-zinc-500 font-mono">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Fleet Overview", href: "/dashboard", icon: LayoutDashboard },
    ...(user?.role === "superadmin" ? [{ name: "B2B Companies", href: "/dashboard/companies", icon: Building }] : []),
    { name: "Register Machinery", href: "/dashboard/machinery", icon: PlusCircle },
    ...(user?.role === "superadmin" ? [
      { name: "Maintenance Portal", href: "/dashboard/maintenance", icon: Wrench },
      { name: "Checklists", href: "/dashboard/checklists", icon: ClipboardList },
      { name: "Settings", href: "/dashboard/settings", icon: Settings }
    ] : []),
  ];

  return (
    <div className="h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col md:flex-row overflow-hidden">
      
      {/* Mobile Header Banner */}
      <header className="md:hidden flex h-16 items-center justify-between border-b border-zinc-900 bg-zinc-950/80 px-4 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-md w-7 h-7 overflow-hidden flex items-center justify-center">
            <img src={logoPath} alt="WFS Logo" className="w-full h-full object-cover filter brightness-110" />
          </div>
          <span className="font-bold text-sm tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">WFS Fleet</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="p-1 border border-zinc-800 rounded bg-zinc-900 text-zinc-400 hover:text-zinc-200 cursor-pointer"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 border-r border-zinc-900 bg-zinc-950 flex flex-col justify-between transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:h-screen overflow-y-auto no-scrollbar
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col gap-6 p-6">
          
          {/* Logo / Header */}
          <div className="hidden md:flex items-center gap-2.5">
            <div className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg w-9 h-9 overflow-hidden flex items-center justify-center">
              <img src={logoPath} alt="WFS Logo" className="w-full h-full object-cover filter brightness-110" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">WillyFastSolutions</span>
              <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">Fleet Management</p>
            </div>
          </div>

          {/* User Profile Summary Card */}
          <div className="border border-zinc-900 bg-zinc-900/20 rounded-xl p-4 flex gap-3 items-center mt-2">
            <div className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-zinc-200 truncate">{user?.full_name}</div>
              <div className="text-[10px] text-zinc-500 truncate mb-1">{user?.email}</div>
              
              <div className="flex flex-wrap gap-1 mt-1">
                {user?.role === "superadmin" ? (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold bg-purple-500/10 border border-purple-500/20 text-purple-400 uppercase">
                    <ShieldAlert className="h-2 w-2" /> Superadmin
                  </span>
                ) : (
                  <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase">
                    Tenant Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1 mt-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? "bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-sm" 
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent"}
                  `}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? "text-zinc-200" : "text-zinc-500"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Area with Sign Out */}
        <div className="p-6 border-t border-zinc-900 flex flex-col gap-4">
          <div className="text-[10px] text-zinc-600 font-sans truncate">
            Tenant: <span className="font-semibold text-zinc-500">{companyName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full h-10 rounded-lg border border-zinc-900 bg-zinc-950 px-4 text-xs font-semibold text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 md:p-10 overflow-y-auto">
        {children}
      </main>

      {/* Overlay Backdrop for Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

    </div>
  );
}
