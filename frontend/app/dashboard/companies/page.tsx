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
  Briefcase
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

  const refreshData = () => {
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

        // Fetch companies and machinery
        const comps = mockDb.getCompanies();
        setCompanies(comps);

        const macs = mockDb.getMachinery();
        setMachinery(macs);
      }
    }
  };

  useEffect(() => {
    mockDb.initialize();
    refreshData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!companyName.trim()) {
      setStatus({ type: "error", text: "Please enter a valid company name." });
      return;
    }

    // Check if company name already exists
    const exists = companies.some(c => c.name.toLowerCase() === companyName.trim().toLowerCase());
    if (exists) {
      setStatus({ type: "error", text: "A company with this name is already registered." });
      return;
    }

    setIsSubmitting(true);

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
          Add new client corporations and inspect active fleets in the system database.
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
              <Briefcase className="h-4 w-4 text-zinc-400" /> Active B2B Clients Registry
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
                      <th className="py-3 px-2 text-right">Active Fleet Assets</th>
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
                        <td className="py-4 px-2 text-right font-mono font-bold text-zinc-400">
                          {getAssetCount(comp.id)} machines
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

    </div>
  );
}
