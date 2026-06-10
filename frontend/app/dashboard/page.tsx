"use client";

import React, { useEffect, useState } from "react";
import { 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Clock, 
  Filter,
  CheckCircle,
  FileText,
  Search,
  Wrench,
  ChevronDown
} from "lucide-react";
import { Profile, Company, Machine, mockDb } from "./mockDb";

export default function FleetOverview() {
  const [user, setUser] = useState<Profile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [machinery, setMachinery] = useState<Machine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);

  // Modal States
  const [hoursModalMachine, setHoursModalMachine] = useState<Machine | null>(null);
  const [newHoursValue, setNewHoursValue] = useState<number>(0);
  const [hoursModalError, setHoursModalError] = useState<string | null>(null);

  const [revokeModalMachine, setRevokeModalMachine] = useState<Machine | null>(null);

  // Fetch Session & Data
  const refreshData = () => {
    if (typeof window !== "undefined") {
      const sessionStr = sessionStorage.getItem("wfs_session");
      if (sessionStr) {
        const profile = JSON.parse(sessionStr) as Profile;
        setUser(profile);
        
        // Fetch companies for Superadmin
        if (profile.role === "superadmin") {
          const comps = mockDb.getCompanies();
          setCompanies(comps);
          // Fetch all machinery
          const macs = mockDb.getMachinery(selectedCompanyId === "all" ? null : selectedCompanyId);
          setMachinery(macs);
        } else {
          // Fetch machinery for current company
          const macs = mockDb.getMachinery(profile.company_id);
          setMachinery(macs);
        }
      }
    }
  };

  useEffect(() => {
    mockDb.initialize();
    refreshData();
  }, [selectedCompanyId]);

  const handleLogHoursSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoursModalMachine || !user) return;
    
    if (newHoursValue < hoursModalMachine.current_hours) {
      setHoursModalError(`New hours cannot be less than current hours (${hoursModalMachine.current_hours} hrs).`);
      return;
    }

    const success = mockDb.logHours(hoursModalMachine.id, newHoursValue, user.id);
    if (success) {
      setHoursModalMachine(null);
      setHoursModalError(null);
      refreshData();
    } else {
      setHoursModalError("Failed to log hours. Please check input values.");
    }
  };

  const handleRevokeSubmit = () => {
    if (!revokeModalMachine) return;
    const success = mockDb.deleteMachine(revokeModalMachine.id);
    if (success) {
      setRevokeModalMachine(null);
      refreshData();
    }
  };

  // Calculations for KPIs
  const totalFleetSize = machinery.length;
  const overdueMaintenanceCount = machinery.filter(m => {
    const hoursSinceLast = m.current_hours - m.last_maintenance_hours;
    return hoursSinceLast >= m.maintenance_threshold_hours;
  }).length;

  const averageHours = totalFleetSize > 0 
    ? Math.round(machinery.reduce((acc, m) => acc + m.current_hours, 0) / totalFleetSize)
    : 0;

  // Filtered machinery list (Search + Role checks)
  const filteredMachinery = machinery.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.serial_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getMachineTypeIcon = (type: Machine["type"]) => {
    switch (type) {
      case "forklift":
        return <Activity className="h-5 w-5 text-zinc-400" />;
      case "excavator":
        return <Wrench className="h-5 w-5 text-zinc-400" />;
      default:
        return <Clock className="h-5 w-5 text-zinc-400" />;
    }
  };

  const selectedCompanyName = selectedCompanyId === "all" 
    ? "All Companies" 
    : companies.find(c => c.id === selectedCompanyId)?.name || "All Companies";

  return (
    <div className="space-y-8">
      
      {/* Header and Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Fleet Overview</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Logged in as <span className="font-semibold text-zinc-400">{user?.full_name}</span>. Real-time telemetry audits.
          </p>
        </div>

        {/* Superadmin Company Filter - Custom Selector (NO native select) */}
        {user?.role === "superadmin" && (
          <div className="relative z-20">
            <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filter Company
            </div>
            
            <button
              onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
              className="flex w-56 h-10 items-center justify-between rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-xs font-semibold text-zinc-300 hover:border-zinc-800 hover:text-zinc-100 transition-all cursor-pointer"
            >
              <span>{selectedCompanyName}</span>
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            </button>

            {isCompanyDropdownOpen && (
              <div className="absolute right-0 mt-1 w-56 rounded-lg border border-zinc-900 bg-zinc-950 p-1 shadow-2xl">
                <button
                  onClick={() => {
                    setSelectedCompanyId("all");
                    setIsCompanyDropdownOpen(false);
                  }}
                  className={`flex w-full items-center px-3 py-2 text-left text-xs font-medium rounded-md hover:bg-zinc-900 transition-colors cursor-pointer ${
                    selectedCompanyId === "all" ? "text-zinc-100 bg-zinc-900/40" : "text-zinc-400"
                  }`}
                >
                  All Companies
                </button>
                {companies.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => {
                      setSelectedCompanyId(comp.id);
                      setIsCompanyDropdownOpen(false);
                    }}
                    className={`flex w-full items-center px-3 py-2 text-left text-xs font-medium rounded-md hover:bg-zinc-900 transition-colors cursor-pointer ${
                      selectedCompanyId === comp.id ? "text-zinc-100 bg-zinc-900/40" : "text-zinc-400"
                    }`}
                  >
                    {comp.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* KPI Highlight Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="border border-zinc-900 bg-zinc-900/20 backdrop-blur-sm rounded-xl p-6 flex items-center gap-4">
          <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-lg flex items-center justify-center text-zinc-400">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500">Total Fleet Assets</span>
            <div className="text-3xl font-extrabold tracking-tight text-zinc-100 font-mono mt-0.5">{totalFleetSize}</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="border border-zinc-900 bg-zinc-900/20 backdrop-blur-sm rounded-xl p-6 flex items-center gap-4 relative overflow-hidden">
          <div className={`absolute inset-0 opacity-5 blur-2xl ${overdueMaintenanceCount > 0 ? "bg-rose-500" : "bg-emerald-500"}`} />
          <div className={`p-3 rounded-lg border flex items-center justify-center ${
            overdueMaintenanceCount > 0 
              ? "bg-rose-950/20 border-rose-900 text-rose-400" 
              : "bg-emerald-950/20 border-emerald-900 text-emerald-400"
          }`}>
            {overdueMaintenanceCount > 0 ? <AlertTriangle className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500">Maintenance Overdue</span>
            <div className={`text-3xl font-extrabold tracking-tight font-mono mt-0.5 ${
              overdueMaintenanceCount > 0 ? "text-rose-400" : "text-emerald-400"
            }`}>{overdueMaintenanceCount}</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="border border-zinc-900 bg-zinc-900/20 backdrop-blur-sm rounded-xl p-6 flex items-center gap-4">
          <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-lg flex items-center justify-center text-zinc-400">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500">Avg. Fleet Hours</span>
            <div className="text-3xl font-extrabold tracking-tight text-zinc-100 font-mono mt-0.5">
              {averageHours} <span className="text-sm font-normal text-zinc-500">hrs</span>
            </div>
          </div>
        </div>

      </div>

      {/* Search and Inventory Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-950 border border-zinc-900 rounded-xl p-4">
        <div className="relative w-full flex-1">
          <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-zinc-600" />
          <input
            type="text"
            placeholder="Search assets by name, brand, serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-zinc-900 bg-zinc-900/30 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 transition-colors"
          />
        </div>
      </div>

      {/* Fleet Inventory Machinery Grid */}
      {filteredMachinery.length === 0 ? (
        <div className="border border-dashed border-zinc-900 rounded-2xl py-16 text-center space-y-3">
          <Activity className="h-8 w-8 text-zinc-700 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-400">No Fleet Assets Found</h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">Try broadening your search or add a new machine to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMachinery.map((mac) => {
            const hoursSincePM = mac.current_hours - mac.last_maintenance_hours;
            const percentage = Math.min(Math.max((hoursSincePM / mac.maintenance_threshold_hours) * 100, 0), 100);
            const isOverdue = hoursSincePM >= mac.maintenance_threshold_hours;
            
            return (
              <div 
                key={mac.id}
                className="border border-zinc-900 bg-zinc-900/10 hover:border-zinc-800/80 transition-all rounded-xl overflow-hidden flex flex-col justify-between gap-6 relative group"
              >
                {mac.photo && (
                  <div className="h-36 w-full border-b border-zinc-900 overflow-hidden bg-zinc-950">
                    <img src={mac.photo} alt={mac.name} className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                
                <div className="p-5 flex flex-col justify-between gap-6 flex-1">
                  {/* Header Information */}
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                      <div className="bg-zinc-950 border border-zinc-900 p-2 rounded-lg text-zinc-400">
                        {getMachineTypeIcon(mac.type)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-200">{mac.name}</h4>
                        <div className="text-[10px] text-zinc-500 mt-0.5 capitalize">{mac.brand} {mac.model}</div>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      isOverdue 
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse" 
                        : "bg-zinc-800 border-zinc-800 text-zinc-400"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isOverdue ? "bg-rose-500" : "bg-zinc-500"}`} />
                      {isOverdue ? "OVERDUE" : "OK"}
                    </div>
                  </div>

                  {/* Serial Number & Company Info */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-900 text-[10px] text-zinc-500">
                    <div>
                      <span className="text-zinc-600 block uppercase font-bold text-[8px]">Serial Number</span>
                      <span className="font-mono">{mac.serial_number}</span>
                    </div>
                    {user?.role === "superadmin" && (
                      <div>
                        <span className="text-zinc-600 block uppercase font-bold text-[8px]">Owner Company</span>
                        <span className="truncate block">
                          {companies.find(c => c.id === mac.company_id)?.name || "Unknown"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Telemetry */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-500 font-medium">Interval: {hoursSincePM.toFixed(1)}h / {mac.maintenance_threshold_hours.toFixed(0)}h</span>
                    <span className="text-zinc-400 font-bold font-mono">Total: {mac.current_hours.toFixed(1)}h</span>
                  </div>
                  
                  {/* Outer Bar */}
                  <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                    {/* Inner Bar */}
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isOverdue ? "bg-rose-500" : "bg-zinc-400"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center gap-2 border-t border-zinc-900 pt-3.5">
                  <button
                    onClick={() => {
                      setHoursModalMachine(mac);
                      setNewHoursValue(mac.current_hours);
                    }}
                    className="flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-900 bg-zinc-950 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 hover:border-zinc-800 transition-all cursor-pointer"
                  >
                    <Clock className="h-3.5 w-3.5" /> Log Hours
                  </button>
                  
                  <button
                    onClick={() => setRevokeModalMachine(mac)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-950 text-xs font-semibold text-zinc-500 hover:bg-rose-500/5 hover:border-rose-500/20 hover:text-rose-400 transition-all cursor-pointer"
                    aria-label="Revoke Machine"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

              </div>
            </div>
          );
          })}
        </div>
      )}

      {/* Log Hours Modal Overlay */}
      {hoursModalMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-sm rounded-xl shadow-2xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Log Operating Hours</h3>
              <p className="text-xs text-zinc-500 mt-1">Increment horómetro for {hoursModalMachine.name}.</p>
            </div>

            {hoursModalError && (
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-400">
                {hoursModalError}
              </div>
            )}

            <form onSubmit={handleLogHoursSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-600">Current Value</label>
                <div className="text-xs text-zinc-400 font-mono bg-zinc-900/50 border border-zinc-900 px-3 py-2 rounded">
                  {hoursModalMachine.current_hours.toFixed(1)} hrs (Last PM: {hoursModalMachine.last_maintenance_hours.toFixed(1)}h)
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="log-hours-input" className="text-[10px] uppercase font-bold text-zinc-500">New Value (Hours)</label>
                <input
                  type="number"
                  id="log-hours-input"
                  step="0.1"
                  required
                  value={newHoursValue}
                  onChange={(e) => {
                    setNewHoursValue(Number(e.target.value));
                    setHoursModalError(null);
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-900 bg-zinc-900/40 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 transition-colors font-mono"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setHoursModalMachine(null);
                    setHoursModalError(null);
                  }}
                  className="inline-flex h-9 items-center justify-center px-4 rounded-lg border border-zinc-900 bg-zinc-950 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center px-4 rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revoke Machine Confirmation Modal Overlay */}
      {revokeModalMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-sm rounded-xl shadow-2xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Revoke Machinery?</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Are you sure you want to revoke/delete <span className="text-zinc-300 font-semibold">{revokeModalMachine.name}</span>? This action will permanentely remove this machine from the company fleet registry.
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setRevokeModalMachine(null)}
                className="inline-flex h-9 items-center justify-center px-4 rounded-lg border border-zinc-900 bg-zinc-950 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeSubmit}
                className="inline-flex h-9 items-center justify-center px-4 rounded-lg bg-rose-500 text-xs font-semibold text-zinc-100 hover:bg-rose-600 transition-all cursor-pointer"
              >
                Delete Asset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
