"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building, 
  Plus, 
  Check, 
  ShieldAlert, 
  Activity, 
  Clock,
  Briefcase,
  Trash2,
  Power,
  Loader2,
  Lock,
  AlertTriangle,
  X
} from "lucide-react";
import { Profile, Company, Machine, mockDb } from "../mockDb";

export default function B2BCompanies() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [machinery, setMachinery] = useState<Machine[]>([]);
  
  // Form States
  const [companyName, setCompanyName] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Authorization States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"delete" | "toggle-active">("toggle-active");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);

  const refreshData = async () => {
    if (typeof window !== "undefined") {
      const sessionStr = sessionStorage.getItem("wfs_session");
      if (sessionStr) {
        const profile = JSON.parse(sessionStr) as Profile;
        setUser(profile);
        
        // Guard: Only Superadmin can access this page
        if (profile.role !== "superadmin") {
          router.push("/dashboard");
          return;
        }

        const isOffline = window.location.protocol === "file:";
        const API_BASE_URL = (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
          ? `${window.location.protocol}//${window.location.hostname}:8000`
          : "";

        const macs = mockDb.getMachinery();
        setMachinery(macs);

        if (!isOffline) {
          try {
            const token = sessionStorage.getItem("wfs_token");
            const response = await fetch(`${API_BASE_URL}/api/companies/`, {
              headers: {
                "Authorization": `Bearer ${token}`
              }
            });
            if (response.ok) {
              const data = await response.json() as Company[];
              setCompanies(data);
              // Sync to local storage for offline fallback compatibility
              localStorage.setItem('wfs_companies', JSON.stringify(data));
              return;
            }
          } catch (err) {
            console.warn("Could not fetch companies from API, using mockDb fallback:", err);
          }
        }

        // Fallback to local storage
        const comps = mockDb.getCompanies();
        setCompanies(comps);
      }
    }
  };

  useEffect(() => {
    mockDb.initialize();
    refreshData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!companyName.trim()) {
      setStatus({ type: "error", text: "Please enter a valid company name." });
      return;
    }

    const exists = companies.some(c => c.name.toLowerCase() === companyName.trim().toLowerCase());
    if (exists) {
      setStatus({ type: "error", text: "A company with this name is already registered." });
      return;
    }

    setIsSubmitting(true);

    const isOffline = typeof window !== "undefined" && window.location.protocol === "file:";
    const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : "";

    if (!isOffline) {
      try {
        const token = sessionStorage.getItem("wfs_token");
        const response = await fetch(`${API_BASE_URL}/api/companies/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ name: companyName.trim() })
        });

        if (response.ok) {
          setStatus({ type: "success", text: "B2B Company registered successfully!" });
          setCompanyName("");
          refreshData();
          setIsSubmitting(false);
          return;
        } else {
          const errData = await response.json();
          setStatus({ type: "error", text: errData.detail || "Failed to register company." });
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        console.error("API error, failing back to mockDb:", err);
      }
    }

    // Offline / Fallback
    setTimeout(() => {
      try {
        mockDb.addCompany(companyName.trim());
        setStatus({ type: "success", text: "B2B Company registered successfully!" });
        setCompanyName("");
        refreshData();
      } catch (err) {
        setStatus({ type: "error", text: "Failed to save company." });
      } finally {
        setIsSubmitting(false);
      }
    }, 1000);
  };

  const openConfirmation = (action: "delete" | "toggle-active", company: Company) => {
    setConfirmAction(action);
    setSelectedCompany(company);
    setConfirmPassword("");
    setModalError(null);
    setShowConfirmModal(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!confirmPassword) {
      setModalError("Please enter your password to authorize this action.");
      return;
    }

    if (!selectedCompany) return;

    setIsModalSubmitting(true);

    const isOffline = typeof window !== "undefined" && window.location.protocol === "file:";
    const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : "";

    if (!isOffline) {
      try {
        const token = sessionStorage.getItem("wfs_token");
        const endpoint = confirmAction === "delete"
          ? `${API_BASE_URL}/api/companies/${selectedCompany.id}`
          : `${API_BASE_URL}/api/companies/${selectedCompany.id}/toggle-active`;
        
        const method = confirmAction === "delete" ? "DELETE" : "PATCH";

        const response = await fetch(endpoint, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ password: confirmPassword })
        });

        if (response.ok) {
          setShowConfirmModal(false);
          setConfirmPassword("");
          setSelectedCompany(null);
          refreshData();
          
          if (confirmAction === "delete") {
            setStatus({ type: "success", text: "B2B Company and all associated accounts/machines deleted successfully!" });
          } else {
            setStatus({ type: "success", text: "B2B Company status toggled successfully!" });
          }
          setIsModalSubmitting(false);
          return;
        } else {
          const errData = await response.json();
          setModalError(errData.detail || "Authentication check failed. Please check your password.");
          setIsModalSubmitting(false);
          return;
        }
      } catch (err) {
        console.error("API error during authorization:", err);
        setModalError("Server communication error. Cannot verify credentials.");
        setIsModalSubmitting(false);
        return;
      }
    }

    // Offline / MockDb Fallback
    setTimeout(() => {
      try {
        if (confirmPassword !== "admin1234") {
          setModalError("Invalid password confirmation. Hint: Use admin1234");
          setIsModalSubmitting(false);
          return;
        }

        const comps = mockDb.getCompanies();
        if (confirmAction === "delete") {
          // Delete from local storage mockDb
          const updatedComps = comps.filter(c => c.id !== selectedCompany.id);
          localStorage.setItem('wfs_companies', JSON.stringify(updatedComps));
          
          // Also delete associated machinery in local storage
          const macs = mockDb.getMachinery();
          const updatedMacs = macs.filter(m => m.company_id !== selectedCompany.id);
          localStorage.setItem('wfs_machinery', JSON.stringify(updatedMacs));
          
          setStatus({ type: "success", text: "B2B Company and all associated assets deleted successfully!" });
        } else {
          // Toggle active
          const updatedComps = comps.map(c => {
            if (c.id === selectedCompany.id) {
              return { ...c, active: !c.active };
            }
            return c;
          });
          localStorage.setItem('wfs_companies', JSON.stringify(updatedComps));
          setStatus({ type: "success", text: "B2B Company status toggled successfully!" });
        }

        setShowConfirmModal(false);
        setConfirmPassword("");
        setSelectedCompany(null);
        refreshData();
      } catch (err) {
        setModalError("Failed to update data.");
      } finally {
        setIsModalSubmitting(false);
      }
    }, 1000);
  };

  // Get asset count per company
  const getAssetCount = (companyId: string) => {
    return machinery.filter(m => m.company_id === companyId).length;
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
          <Building className="h-6 w-6 text-zinc-400" /> B2B Companies Directory
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Add new client corporations, toggle active status, or delete accounts from the system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Register Company Form (Span 1) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-3">
              <Plus className="h-4 w-4 text-zinc-400" /> Register B2B Client
            </h3>

            {status && (
              <div className={`p-3 rounded-lg text-xs border transition-all duration-300 ${
                status.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}>
                {status.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="comp-name" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Company Name</label>
                <input
                  type="text"
                  id="comp-name"
                  placeholder="e.g. Delta Transport Inc."
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-zinc-100 transition-all shadow-md cursor-pointer"
              >
                {isSubmitting ? "Saving Company..." : "Register Company"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Companies List (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-3">
              <Briefcase className="h-4 w-4 text-zinc-400" /> B2B Clients Registry
            </h3>

            {companies.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500 font-mono">
                No B2B companies found in the registry.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-2">Company Name</th>
                      <th className="py-3 px-2">Database ID</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-center">Active Assets</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-300">
                    {companies.map(comp => (
                      <tr key={comp.id} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="py-4 px-2 font-bold text-zinc-200">
                          {comp.name}
                        </td>
                        <td className="py-4 px-2 text-zinc-500 font-mono">
                          {comp.id}
                        </td>
                        <td className="py-4 px-2">
                          {comp.active === false ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" /> Deactivated
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-2 text-center font-mono font-bold text-zinc-400">
                          {getAssetCount(comp.id)}
                        </td>
                        <td className="py-4 px-2 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => openConfirmation("toggle-active", comp)}
                              title={comp.active === false ? "Activate Company" : "Deactivate Company"}
                              className={`p-1.5 rounded border transition-all cursor-pointer ${
                                comp.active === false
                                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10"
                                  : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                              }`}
                            >
                              <Power className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openConfirmation("delete", comp)}
                              title="Delete Company and Assets"
                              className="p-1.5 rounded border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Confirmation Password Verification Modal */}
      {showConfirmModal && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="w-full max-w-md border border-zinc-900 bg-zinc-950 rounded-2xl shadow-2xl p-6 relative space-y-4">
            
            {/* Close Button */}
            <button 
              onClick={() => {
                setShowConfirmModal(false);
                setConfirmPassword("");
                setSelectedCompany(null);
              }}
              className="absolute top-4 right-4 p-1 border border-zinc-900 rounded bg-zinc-900 text-zinc-500 hover:text-zinc-300 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
              <ShieldAlert className="h-5 w-5 text-rose-400" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-200">
                Security Authorization Required
              </h3>
            </div>

            {/* Warning Message */}
            <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-xs text-rose-400 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                {confirmAction === "delete" ? (
                  <p>
                    <strong>WARNING:</strong> You are about to permanently delete B2B client <strong>"{selectedCompany.name}"</strong>. This will delete all associated machinery, operator accounts, and maintenance histories. This action is irreversible.
                  </p>
                ) : (
                  <p>
                    You are about to change the active status of B2B client <strong>"{selectedCompany.name}"</strong>. Deactivated companies will block operators from logging into the platform.
                  </p>
                )}
              </div>
            </div>

            {/* Error Message */}
            {modalError && (
              <div className="p-2 border border-rose-500/20 bg-rose-500/10 rounded-lg text-xs text-rose-400">
                {modalError}
              </div>
            )}

            {/* Password verification form */}
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="confirm-pass" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Superadmin Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-700" />
                  <input
                    type="password"
                    id="confirm-pass"
                    required
                    placeholder="Enter password to authorize"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-800 focus:outline-none focus:border-zinc-800 transition-colors"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmPassword("");
                    setSelectedCompany(null);
                  }}
                  className="px-4 h-10 border border-zinc-900 bg-zinc-900/40 text-xs font-semibold text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isModalSubmitting}
                  className={`inline-flex items-center justify-center px-4 h-10 rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer ${
                    confirmAction === "delete"
                      ? "bg-rose-600 text-zinc-100 hover:bg-rose-700"
                      : "bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
                  }`}
                >
                  {isModalSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Authorizing...
                    </>
                  ) : (
                    confirmAction === "delete" ? "Authorize Deletion" : "Authorize Status Toggle"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
