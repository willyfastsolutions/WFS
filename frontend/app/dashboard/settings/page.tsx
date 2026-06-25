"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings, 
  Clock, 
  ShieldAlert, 
  Building, 
  Activity, 
  Wrench,
  FileText,
  Save,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sliders,
  Download,
  Info,
  Mail
} from "lucide-react";
import { Profile, Company, Machine, mockDb } from "../mockDb";
import { motion, AnimatePresence } from "framer-motion";

export default function SuperadminSettings() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [machinery, setMachinery] = useState<Machine[]>([]);
  
  // Agent Configuration State
  const [scanHours, setScanHours] = useState<number>(24);
  const [defaultThreshold, setDefaultThreshold] = useState<number>(250);
  
  // UI States
  const [expandedCompanies, setExpandedCompanies] = useState<{ [companyId: string]: boolean }>({});
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [generatingReportMachineId, setGeneratingReportMachineId] = useState<string | null>(null);
  const [emailingReportMachineId, setEmailingReportMachineId] = useState<string | null>(null);

  const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : "";

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

        // Fetch settings from local DB first (as fallback)
        const config = mockDb.getSystemSettings();
        setScanHours(Math.max(1, Math.round(config.scan_interval_seconds / 3600)));
        setDefaultThreshold(config.default_maintenance_threshold);

        // If online (server mode), try to fetch real settings from the API
        if (window.location.protocol !== "file:") {
          fetch(`${API_BASE_URL}/api/settings/`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${sessionStorage.getItem("wfs_token") || ""}`
            }
          })
          .then(res => {
            if (res.status === 401) {
              sessionStorage.removeItem("wfs_token");
              sessionStorage.removeItem("wfs_role");
              sessionStorage.removeItem("wfs_session");
              router.push("/login");
              return;
            }
            if (res.ok) return res.json();
            throw new Error("Failed to fetch settings from server");
          })
          .then(data => {
            if (data && data.scan_interval_seconds !== undefined) {
              setScanHours(Math.max(1, Math.round(data.scan_interval_seconds / 3600)));
              setDefaultThreshold(data.default_maintenance_threshold);
              // Sync back to local mock DB
              mockDb.updateSystemSettings(data.scan_interval_seconds, data.default_maintenance_threshold);
            }
          })
          .catch(err => console.warn("Could not sync settings from real API, using mock DB:", err));
        }

        // Fetch companies and machinery
        const comps = mockDb.getCompanies();
        setCompanies(comps);

        const macs = mockDb.getMachinery();
        setMachinery(macs);

        // Expand all companies by default
        const expansions: { [companyId: string]: boolean } = {};
        comps.forEach(c => {
          expansions[c.id] = true;
        });
        setExpandedCompanies(expansions);
      }
    }
  };

  useEffect(() => {
    mockDb.initialize();
    refreshData();
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setIsSaving(true);

    if (scanHours < 1) {
      setStatus({ type: "error", text: "Scan interval must be at least 1 hour." });
      setIsSaving(false);
      return;
    }

    if (defaultThreshold < 10) {
      setStatus({ type: "error", text: "Default warning threshold must be at least 10 hours." });
      setIsSaving(false);
      return;
    }

    setTimeout(() => {
      try {
        // Convert scan frequency hours back to seconds for backend compatibility
        const intervalSeconds = scanHours * 3600;
        mockDb.updateSystemSettings(intervalSeconds, defaultThreshold);

        // If online (server mode), try to persist to real API
        if (typeof window !== "undefined" && window.location.protocol !== "file:") {
          fetch(`${API_BASE_URL}/api/settings/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${sessionStorage.getItem("wfs_token") || ""}`
            },
            body: JSON.stringify({
              scan_interval_seconds: intervalSeconds,
              default_maintenance_threshold: defaultThreshold
            })
          })
          .then(res => {
            if (res.status === 401) {
              sessionStorage.removeItem("wfs_token");
              sessionStorage.removeItem("wfs_role");
              sessionStorage.removeItem("wfs_session");
              router.push("/login");
            }
          })
          .catch(err => console.warn("Could not sync settings to real API:", err));
        }

        setStatus({ 
          type: "success", 
          text: `Configuration updated successfully! Scan loop set to every ${scanHours} hours (${intervalSeconds.toLocaleString()}s).` 
        });
        refreshData();
      } catch (err) {
        setStatus({ type: "error", text: "Failed to save settings." });
      } finally {
        setIsSaving(false);
      }
    }, 800);
  };

  const handleGenerateManualReport = async (machineId: string, serial: string) => {
    setStatus(null);
    setGeneratingReportMachineId(machineId);

    try {
      if (typeof window !== "undefined" && window.location.protocol !== "file:") {
        const machine = machinery.find(m => m.id === machineId);
        if (!machine) {
          throw new Error("Machine not found locally.");
        }
        const company = companies.find(c => c.id === machine.company_id);
        const companyName = company ? company.name : "Unknown B2B Tenant";

        // Server mode: Hit real ReportLab generator endpoint
        const response = await fetch(`${API_BASE_URL}/api/machinery/${machineId}/generate-report`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("wfs_token") || ""}`
          },
          body: JSON.stringify({
            name: machine.name,
            type: machine.type,
            brand: machine.brand || null,
            model: machine.model || null,
            serial_number: machine.serial_number || null,
            current_hours: machine.current_hours,
            last_maintenance_hours: machine.last_maintenance_hours,
            maintenance_threshold_hours: machine.maintenance_threshold_hours,
            photo: machine.photo || null,
            company_id: machine.company_id || null,
            company_name: companyName
          })
        });

        if (response.status === 401) {
          sessionStorage.removeItem("wfs_token");
          sessionStorage.removeItem("wfs_role");
          sessionStorage.removeItem("wfs_session");
          router.push("/login");
          return;
        }

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `report_${serial}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setStatus({ 
            type: "success", 
            text: `Executive report for serial ${serial} compiled and downloaded successfully!` 
          });
        } else {
          throw new Error("Backend PDF compilation failed.");
        }
      } else {
        // Offline / mock mode
        await new Promise(resolve => setTimeout(resolve, 1000));
        mockDb.generateMachineReportPDF(machineId);
        setStatus({ 
          type: "success", 
          text: `[OFFLINE MODE] PDF report for Serial ${serial} compiled and saved in 'backend/reports/' directory.` 
        });
      }
    } catch (err) {
      console.error(err);
      setStatus({ 
        type: "error", 
        text: `Failed to fetch from API. Fallback triggered: [OFFLINE MODE] PDF report compiled and saved to 'backend/reports/' folder.` 
      });
      mockDb.generateMachineReportPDF(machineId);
    } finally {
      setGeneratingReportMachineId(null);
    }
  };

  const handleEmailReport = async (machineId: string, machine: Machine) => {
    setEmailingReportMachineId(machineId);
    setStatus(null);
    try {
      const isOffline = typeof window !== "undefined" && window.location.protocol === "file:";
      if (!isOffline) {
        const company = companies.find(c => c.id === machine.company_id);
        const companyName = company ? company.name : "Unknown B2B Tenant";
        const response = await fetch(`${API_BASE_URL}/api/machinery/${machineId}/email-report`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("wfs_token") || ""}`
          },
          body: JSON.stringify({
            name: machine.name,
            type: machine.type,
            brand: machine.brand || null,
            model: machine.model || null,
            serial_number: machine.serial_number || null,
            current_hours: machine.current_hours,
            last_maintenance_hours: machine.last_maintenance_hours,
            maintenance_threshold_hours: machine.maintenance_threshold_hours,
            photo: machine.photo || null,
            company_id: machine.company_id || null,
            company_name: companyName
          })
        });

        if (response.status === 401) {
          sessionStorage.removeItem("wfs_token");
          sessionStorage.removeItem("wfs_role");
          sessionStorage.removeItem("wfs_session");
          router.push("/login");
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setStatus({
            type: "success",
            text: `Report emailed successfully to ${data.sent_to}!`
          });
        } else {
          const errData = await response.json();
          setStatus({
            type: "error",
            text: errData.detail || "Failed to email report."
          });
        }
      } else {
        setStatus({ type: "error", text: "Email reports are not available in offline mode." });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: "Failed to email report. Connection error." });
    } finally {
      setEmailingReportMachineId(null);
    }
  };

  const toggleCompanyExpansion = (companyId: string) => {
    setExpandedCompanies(prev => ({
      ...prev,
      [companyId]: !prev[companyId]
    }));
  };

  const getMachineIcon = (type: Machine["type"]) => {
    switch (type) {
      case "forklift":
        return <Activity className="h-4 w-4 text-zinc-400" />;
      case "excavator":
        return <Wrench className="h-4 w-4 text-zinc-400" />;
      default:
        return <Clock className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Settings className="h-6 w-6 text-zinc-400" /> Agent Configuration
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Configure background scan routines, modify safety threshold values, and compile executive PDF reports on-demand.
          </p>
        </div>
      </div>

      {status && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg text-xs border transition-all duration-300 ${
            status.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <span>{status.text}</span>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Configuration Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-5 space-y-5 backdrop-blur-md">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-3">
              <Sliders className="h-4 w-4 text-zinc-400" /> Scanning Parameters
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              
              {/* Scan Interval in Hours */}
              <div className="space-y-1.5">
                <label htmlFor="scan-freq" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Scan Frequency (Hours)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="scan-freq"
                    min="1"
                    required
                    value={scanHours}
                    onChange={(e) => setScanHours(Number(e.target.value))}
                    className="w-full h-10 pl-3 pr-10 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 transition-colors"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-semibold font-mono">hrs</span>
                </div>
                <p className="text-[9px] text-zinc-600 leading-normal">
                  Frecuencia de ejecución del demonio para verificar brechas en horómetros.
                </p>
              </div>

              {/* Default Warning Threshold Hours */}
              <div className="space-y-1.5">
                <label htmlFor="warn-threshold" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Default Safety Warning Threshold (Hours)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="warn-threshold"
                    min="10"
                    required
                    value={defaultThreshold}
                    onChange={(e) => setDefaultThreshold(Number(e.target.value))}
                    className="w-full h-10 pl-3 pr-10 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 transition-colors"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-semibold font-mono">hrs</span>
                </div>
                <p className="text-[9px] text-zinc-600 leading-normal">
                  Intervalo de horas límite de uso para alertar y solicitar mantenimiento preventivo.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-zinc-100 transition-all shadow-md cursor-pointer gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                {isSaving ? "Saving Config..." : "Save Configuration"}
              </button>
            </form>
          </div>

          {/* Quick Info Card */}
          <div className="border border-zinc-900 bg-zinc-900/5 rounded-xl p-5 text-xs text-zinc-500 space-y-3 font-sans leading-relaxed">
            <h4 className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-zinc-400" /> Daemon Email Rules
            </h4>
            <p className="text-[11px]">
              El agente escanea periódicamente el estado de los activos. Si un activo sobrepasa el límite establecido, genera un reporte ejecutivo en PDF y lo despacha al administrador del tenant.
            </p>
            <div className="flex gap-2 p-2 border border-amber-500/15 bg-amber-500/5 rounded-lg text-[10px] text-amber-400 font-sans leading-normal">
              <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                Para evitar spam, el agente marca el equipo como notificado y no volverá a despachar correos hasta que se registre un servicio de mantenimiento.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: B2B Tenant Fleet Directory (Machines linked to companies) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-6 shadow-xl space-y-5">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-3">
              <Building className="h-4 w-4 text-zinc-400" /> B2B Tenant Fleet Registry
            </h3>

            {companies.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500 font-mono">
                No active B2B companies found in registry.
              </div>
            ) : (
              <div className="space-y-4">
                {companies.map((comp) => {
                  const compMachines = machinery.filter(m => m.company_id === comp.id);
                  const isExpanded = !!expandedCompanies[comp.id];

                  return (
                    <div key={comp.id} className="border border-zinc-900/60 rounded-xl overflow-hidden bg-zinc-950/20">
                      
                      {/* Company Header Row */}
                      <button
                        onClick={() => toggleCompanyExpansion(comp.id)}
                        className="w-full flex items-center justify-between p-4 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors text-left border-b border-zinc-900/40 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Building className="h-4.5 w-4.5 text-zinc-500" />
                          <div>
                            <span className="font-bold text-sm text-zinc-200">{comp.name}</span>
                            <span className="text-[10px] font-mono text-zinc-500 ml-2">ID: {comp.id}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase tracking-wider">
                            {compMachines.length} assets
                          </span>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                        </div>
                      </button>

                      {/* Expandable Machine List */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            {compMachines.length === 0 ? (
                              <div className="p-6 text-center text-xs text-zinc-650 italic font-sans border-t border-zinc-900/20">
                                No registered machinery assets for this B2B tenant company.
                              </div>
                            ) : (
                              <div className="divide-y divide-zinc-900/30">
                                {compMachines.map((mac) => {
                                  const hoursSincePM = mac.current_hours - mac.last_maintenance_hours;
                                  const isBreached = hoursSincePM >= mac.maintenance_threshold_hours;

                                  return (
                                    <div key={mac.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-900/10 transition-colors">
                                      
                                      {/* Technical Info */}
                                      <div className="flex items-start gap-3 min-w-0">
                                        <div className="mt-1 bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg">
                                          {getMachineIcon(mac.type)}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-xs text-zinc-200">{mac.name}</span>
                                            <span className="text-[9px] text-zinc-500 font-mono">({mac.brand} {mac.model})</span>
                                          </div>
                                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">SN: {mac.serial_number}</div>
                                          
                                          {/* Hours metrics */}
                                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] font-mono text-zinc-500">
                                            <span>Current: <strong className="text-zinc-400">{mac.current_hours.toFixed(1)}h</strong></span>
                                            <span>•</span>
                                            <span>Last PM: <strong className="text-zinc-400">{mac.last_maintenance_hours.toFixed(1)}h</strong></span>
                                            <span>•</span>
                                            <span>Telemetry Interval: 
                                              <strong className={`ml-1 ${isBreached ? "text-rose-400 font-bold" : "text-zinc-400"}`}>
                                                {hoursSincePM.toFixed(1)}h / {mac.maintenance_threshold_hours}h
                                              </strong>
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Action Button: Manual report generation */}
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        {mac.warning_sent && (
                                          <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 uppercase tracking-wider">
                                            Alert Dispatched
                                          </span>
                                        )}

                                        <button
                                          type="button"
                                          disabled={generatingReportMachineId !== null}
                                          onClick={() => handleGenerateManualReport(mac.id, mac.serial_number || "unknown")}
                                          className="inline-flex h-8 px-3 items-center justify-center gap-1.5 rounded-lg border border-zinc-900 bg-zinc-950 text-[10px] font-bold text-zinc-300 hover:border-zinc-800 hover:text-zinc-100 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                                        >
                                          {generatingReportMachineId === mac.id ? (
                                            <>
                                              <span className="h-3 w-3 animate-spin rounded-full border border-zinc-700 border-t-zinc-300" />
                                              Compiling...
                                            </>
                                          ) : (
                                            <>
                                              <Download className="h-3 w-3" />
                                              Generate Report
                                            </>
                                          )}
                                        </button>

                                        <button
                                          type="button"
                                          disabled={emailingReportMachineId !== null}
                                          onClick={() => handleEmailReport(mac.id, mac)}
                                          title="Email report to company admin"
                                          className="inline-flex h-8 px-3 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                                        >
                                          {emailingReportMachineId === mac.id ? (
                                            <>
                                              <span className="h-3 w-3 animate-spin rounded-full border border-emerald-700 border-t-emerald-300" />
                                              Sending...
                                            </>
                                          ) : (
                                            <>
                                              <Mail className="h-3 w-3" />
                                              Email Report
                                            </>
                                          )}
                                        </button>
                                      </div>

                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
