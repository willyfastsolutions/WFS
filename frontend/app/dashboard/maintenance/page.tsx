"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText,
  User,
  History,
  Check,
  ChevronDown,
  Info,
  Filter,
  Search
} from "lucide-react";
import { Profile, Company, Machine, MaintenanceLog, ChecklistTemplate, ChecklistItem, mockDb } from "../mockDb";

export default function MaintenancePortal() {
  const router = useRouter(); // Wait, let's see if useRouter is imported. If not, we should import it!
  const [user, setUser] = useState<Profile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [machinery, setMachinery] = useState<Machine[]>([]);
  const [historyLogs, setHistoryLogs] = useState<(MaintenanceLog & { machineName: string; machineSerial: string })[]>([]);

  // Form States
  const [selectedMachineId, setSelectedMachineId] = useState("");
  const [hoursAtMaintenance, setHoursAtMaintenance] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [resetPhysicalHorometer, setResetPhysicalHorometer] = useState(false);

  // Dynamic Checklist States
  const [activeTemplates, setActiveTemplates] = useState<ChecklistTemplate[]>([]);
  const [activeItems, setActiveItems] = useState<ChecklistItem[]>([]);
  const [checklistSelections, setChecklistSelections] = useState<{ [itemId: string]: boolean }>({});

  // Dropdown UI (No native select)
  const [isMachineDropdownOpen, setIsMachineDropdownOpen] = useState(false);

  // Status message
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshData = () => {
    if (typeof window !== "undefined") {
      const sessionStr = sessionStorage.getItem("wfs_session");
      if (sessionStr) {
        const profile = JSON.parse(sessionStr) as Profile;
        setUser(profile);

        if (profile.role !== "superadmin") {
          router.push("/dashboard");
          return;
        }

        const comps = mockDb.getCompanies();
        setCompanies(comps);

        const targetComp = selectedCompanyId === "all" ? null : selectedCompanyId;
        const macs = mockDb.getMachinery(targetComp);
        setMachinery(macs);

        const logs = mockDb.getMaintenanceLogs(targetComp);
        logs.sort((a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime());
        setHistoryLogs(logs);
      }
    }
  };

  useEffect(() => {
    mockDb.initialize();
    refreshData();
  }, [selectedCompanyId]);

  useEffect(() => {
    setSelectedMachineId("");
    setHoursAtMaintenance(0);
  }, [selectedCompanyId]);

  useEffect(() => {
    if (!selectedMachineId) {
      setActiveTemplates([]);
      setActiveItems([]);
      setChecklistSelections({});
      return;
    }
    const machine = machinery.find(m => m.id === selectedMachineId);
    const companyIdForTemplates = machine ? machine.company_id : (user?.company_id || null);
    
    // Fetch templates matching company (or global)
    const temps = mockDb.getChecklistTemplates(companyIdForTemplates);
    setActiveTemplates(temps);
    
    // Fetch items for these templates
    const tempIds = temps.map(t => t.id);
    const allItems = mockDb.getChecklistItems();
    const filteredItems = allItems.filter(item => tempIds.includes(item.template_id));
    setActiveItems(filteredItems);

    // Initialize checklist selections
    const initialSelections: { [itemId: string]: boolean } = {};
    filteredItems.forEach(item => {
      initialSelections[item.id] = false;
    });
    setChecklistSelections(initialSelections);
  }, [selectedMachineId, machinery, user]);

  const handleSelectMachine = (machine: Machine) => {
    setSelectedMachineId(machine.id);
    setHoursAtMaintenance(machine.current_hours);
    setIsMachineDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!selectedMachineId || !user) {
      setStatus({ type: "error", text: "Please select a machinery asset." });
      return;
    }

    const machine = machinery.find(m => m.id === selectedMachineId);
    if (!machine) return;

    if (!resetPhysicalHorometer && hoursAtMaintenance < machine.last_maintenance_hours) {
      setStatus({ type: "error", text: `Hours at maintenance cannot be less than last maintenance (${machine.last_maintenance_hours} hrs).` });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        // Collect dynamic checklist results
        const checklistResults = activeItems.map(item => ({
          checklist_item_id: item.id,
          passed: !!checklistSelections[item.id]
        }));

        // Populate legacy fields as a fallback based on dynamic selections
        const legacyOil = checklistSelections['item_oil_change'] || false;
        const legacyOilFilter = checklistSelections['item_oil_filter'] || false;
        const legacyAirFilter = checklistSelections['item_air_filter'] || false;
        const legacySpark = checklistSelections['item_spark_plugs'] || false;
        const legacyBattery = checklistSelections['item_battery'] || false;
        const legacyLights = checklistSelections['item_lights'] || false;
        const legacyHorn = checklistSelections['item_horn'] || false;
        const legacyIgnition = checklistSelections['item_ignition'] || false;
        const legacyFuel = checklistSelections['item_fuel'] || false;
        const legacyTires = checklistSelections['item_tires'] || false;

        mockDb.performMaintenance({
          machinery_id: selectedMachineId,
          performed_by: user.id,
          hours_at_maintenance: hoursAtMaintenance,
          oil_change: legacyOil,
          oil_filter_change: legacyOilFilter,
          air_filter_change: legacyAirFilter,
          spark_glow_plugs_change: legacySpark,
          safety_battery: legacyBattery,
          safety_lights: legacyLights,
          safety_horn: legacyHorn,
          safety_ignition: legacyIgnition,
          safety_fuel: legacyFuel,
          safety_tires: legacyTires,
          notes: notes,
          reset_physical_horometer: resetPhysicalHorometer
        }, checklistResults);

        setStatus({ 
          type: "success", 
          text: resetPhysicalHorometer
            ? "Maintenance logged & physical horometer reset back to 0.0h!" 
            : "Preventive maintenance log submitted successfully!" 
        });
        
        // Reset form
        setSelectedMachineId("");
        setHoursAtMaintenance(0);
        setNotes("");
        setResetPhysicalHorometer(false);
        setChecklistSelections({});

        refreshData();
      } catch (err) {
        setStatus({ type: "error", text: "Failed to record maintenance log." });
      } finally {
        setIsSubmitting(false);
      }
    }, 1200);
  };

  // Find overdue machinery
  const overdueMachinery = machinery.filter(m => {
    const hoursSincePM = m.current_hours - m.last_maintenance_hours;
    return hoursSincePM >= m.maintenance_threshold_hours;
  });

  const selectedMachine = machinery.find(m => m.id === selectedMachineId);
  const selectedMachineLabel = selectedMachine 
    ? `${selectedMachine.name} (${selectedMachine.brand} ${selectedMachine.model})` 
    : "Select Fleet Asset";

  const selectedCompanyName = selectedCompanyId === "all" 
    ? "All Companies" 
    : companies.find(c => c.id === selectedCompanyId)?.name || "All Companies";

  return (
    <div className="space-y-8">
      
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Wrench className="h-6 w-6 text-zinc-400" /> Maintenance Portal
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Complete mandatory safety checklists, record services, and review historical logs.
          </p>
        </div>

        {/* Superadmin Company Filter - Custom Selector (NO native select) */}
        {user?.role === "superadmin" && (
          <div className="relative z-20">
            <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filter Company
            </div>
            
            <button
              onClick={() => {
                setIsCompanyDropdownOpen(!isCompanyDropdownOpen);
                setCompanySearchQuery("");
              }}
              className="flex w-56 h-10 items-center justify-between rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-xs font-semibold text-zinc-300 hover:border-zinc-800 hover:text-zinc-100 transition-all cursor-pointer"
            >
              <span>{selectedCompanyName}</span>
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            </button>

            {isCompanyDropdownOpen && (
              <div className="absolute right-0 mt-1 w-56 rounded-lg border border-zinc-900 bg-zinc-950 p-1 shadow-2xl z-30 max-h-72 overflow-y-auto space-y-1">
                {/* Search Box */}
                <div className="p-1.5 border-b border-zinc-900 flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5 text-zinc-650 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search company..."
                    value={companySearchQuery}
                    onChange={(e) => setCompanySearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()} // Prevent closing dropdown
                    className="w-full h-8 px-2 rounded border border-zinc-900 bg-zinc-900 text-[11px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-800"
                  />
                </div>

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
                {companies
                  .filter(comp => comp.name.toLowerCase().includes(companySearchQuery.toLowerCase()))
                  .map((comp) => (
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

      {/* Grid of Alerts and Checklist Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Active warnings (Span 1) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-3">
              <AlertTriangle className="h-4 w-4 text-rose-400" /> Active Service Alerts
            </h3>

            {overdueMachinery.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="h-7 w-7 text-emerald-500 mx-auto" />
                <h4 className="text-xs font-bold text-zinc-400">All Fleet Healthy</h4>
                <p className="text-[10px] text-zinc-500">No assets currently exceed the 250-hour service limit.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {overdueMachinery.map(m => {
                  const hoursSincePM = m.current_hours - m.last_maintenance_hours;
                  return (
                    <div 
                      key={m.id}
                      onClick={() => handleSelectMachine(m)}
                      className="border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/10 transition-colors p-3 rounded-lg flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-zinc-200 truncate">{m.name}</div>
                        <div className="text-[9px] text-zinc-500 font-mono mt-0.5">{m.serial_number}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-rose-400 font-mono">+{hoursSincePM.toFixed(1)}h</div>
                        <div className="text-[8px] text-rose-500 uppercase tracking-wider font-semibold">Service Overdue</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Maintenance Checklist Form (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-3">
              <Wrench className="h-4 w-4 text-zinc-400" /> Log Preventive Maintenance
            </h3>

            {status && (
              <div className={`p-4 rounded-lg text-xs border transition-all duration-300 ${
                status.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}>
                {status.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Asset Selector dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1.5 relative">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Select Machinery Asset</label>
                  <button
                    type="button"
                    onClick={() => setIsMachineDropdownOpen(!isMachineDropdownOpen)}
                    className="flex w-full h-10 items-center justify-between rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-sm text-zinc-300 hover:border-zinc-855 transition-all cursor-pointer"
                  >
                    <span className="truncate">{selectedMachineLabel}</span>
                    <ChevronDown className="h-4 w-4 text-zinc-500" />
                  </button>

                  {isMachineDropdownOpen && (
                    <div className="absolute left-0 mt-1 w-full rounded-lg border border-zinc-900 bg-zinc-950 p-1 shadow-2xl z-30 max-h-56 overflow-y-auto">
                      {machinery.map((mac) => (
                        <button
                          key={mac.id}
                          type="button"
                          onClick={() => handleSelectMachine(mac)}
                          className={`flex w-full items-center justify-between px-3 py-2 text-left rounded-md hover:bg-zinc-900 transition-colors cursor-pointer text-xs font-semibold ${
                            selectedMachineId === mac.id ? "bg-zinc-900/60 text-zinc-100" : "text-zinc-400"
                          }`}
                        >
                          <span>{mac.name} <span className="text-[9px] text-zinc-500 font-normal">({mac.brand} {mac.model})</span></span>
                          {selectedMachineId === mac.id && <Check className="h-3.5 w-3.5 text-zinc-200" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hours logged at maintenance */}
                <div className="space-y-1.5">
                  <label htmlFor="maint-hours" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Hours at Maintenance</label>
                  <input
                    type="number"
                    id="maint-hours"
                    step="0.1"
                    required
                    value={hoursAtMaintenance || ""}
                    onChange={(e) => setHoursAtMaintenance(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 transition-colors font-mono"
                  />
                </div>

              </div>

              {/* Dynamic Checklists Section */}
              {selectedMachineId && activeTemplates.length > 0 && (
                <div className="space-y-6 pt-4 border-t border-zinc-900">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Required Inspection Checklists</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {activeTemplates.map((temp) => {
                      const tempItems = activeItems.filter(i => i.template_id === temp.id);
                      if (tempItems.length === 0) return null;

                      return (
                        <div key={temp.id} className="space-y-3.5 border border-zinc-900/50 bg-zinc-900/5 p-4 rounded-xl">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-900 pb-1.5">{temp.name}</h5>
                          
                          <div className="space-y-2.5">
                            {tempItems.map((item) => (
                              <label 
                                key={item.id} 
                                className="flex items-start gap-3 text-xs text-zinc-400 hover:text-zinc-250 transition-colors cursor-pointer select-none"
                              >
                                <input 
                                  type="checkbox" 
                                  checked={!!checklistSelections[item.id]}
                                  onChange={(e) => setChecklistSelections(prev => ({ ...prev, [item.id]: e.target.checked }))}
                                  className="h-4 w-4 mt-0.5 rounded border-zinc-800 bg-zinc-950 text-zinc-200 focus:ring-0 focus:ring-offset-0 focus:outline-none accent-zinc-200 flex-shrink-0"
                                />
                                <div>
                                  <span className="font-medium">{item.label}</span>
                                  <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider ${
                                    item.category === "routine" 
                                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                      : item.category === "safety"
                                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                      : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                                  }`}>
                                    {item.category}
                                  </span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Toggle option for physical horometer reset */}
              {selectedMachineId && (
                <div className="space-y-3 pt-4 border-t border-zinc-900">
                  <div className="border border-amber-500/10 bg-amber-500/5 rounded-xl p-4 space-y-2.5">
                    <label className="flex items-center gap-3 text-xs font-bold text-zinc-300 hover:text-zinc-150 transition-colors cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={resetPhysicalHorometer}
                        onChange={(e) => setResetPhysicalHorometer(e.target.checked)}
                        className="h-4 w-4 rounded border-amber-900/60 bg-zinc-950 text-amber-500 focus:ring-0 focus:ring-offset-0 focus:outline-none accent-amber-500"
                      />
                      Reset Physical Horometer (Resetear Horómetro Físico a 0.0)
                    </label>
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-sans pl-7">
                      Enable this option only if the machine's physical horometer device has been replaced or reset to 0.0. This will set both the machine's current telemetry hours and last maintenance hours back to 0.0. Leave unchecked to continue accumulation.
                    </p>
                  </div>
                </div>
              )}

              {/* Maintenance Notes */}
              <div className="space-y-1.5 pt-4 border-t border-zinc-900">
                <label htmlFor="maint-notes" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Maintenance Notes / Actions Performed</label>
                <textarea
                  id="maint-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record filter brands, technician checklist observations, or repairs done..."
                  className="w-full p-3 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !selectedMachineId}
                className="w-full inline-flex h-11 items-center justify-center rounded-lg bg-zinc-100 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-zinc-100 transition-all shadow-md cursor-pointer"
              >
                {isSubmitting 
                  ? "Submitting Log Checklist..." 
                  : resetPhysicalHorometer
                  ? "Complete Maintenance & Reset Horometer to 0.0h"
                  : "Complete Maintenance & Record Hours"}
              </button>

            </form>
          </div>
        </div>

      </div>

      {/* Section 3: Audit Log History */}
      <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-6 space-y-4 shadow-xl">
        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-3">
          <History className="h-4 w-4 text-zinc-400" /> Telemetry Audit History Log
        </h3>

        {historyLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500 font-mono">
            No historical maintenance events logged. Complete your first checklist above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Asset / Serial</th>
                  <th className="py-3 px-2">Hours Logged</th>
                  <th className="py-3 px-2">Inspection Status</th>
                  <th className="py-3 px-2">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                {historyLogs.map(log => {
                  // Fetch dynamic results
                  const results = mockDb.getMaintenanceChecklistResults(log.id);
                  let passedCount = 0;
                  let totalCount = 0;

                  if (results.length > 0) {
                    passedCount = results.filter(r => r.passed).length;
                    totalCount = results.length;
                  } else {
                    // Fallback to legacy count
                    const servicesCount = [
                      log.oil_change,
                      log.oil_filter_change,
                      log.air_filter_change,
                      log.spark_glow_plugs_change
                    ].filter(Boolean).length;
                    const safetyCount = [
                      log.safety_battery,
                      log.safety_lights,
                      log.safety_horn,
                      log.safety_ignition,
                      log.safety_fuel,
                      log.safety_tires
                    ].filter(Boolean).length;
                    passedCount = servicesCount + safetyCount;
                    totalCount = 10;
                  }

                  return (
                    <tr key={log.id} className="hover:bg-zinc-900/20 transition-colors">
                      <td className="py-4 px-2 whitespace-nowrap text-zinc-400 font-mono">
                        <div className="flex flex-col gap-1">
                          <span>{new Date(log.performed_at).toLocaleDateString()}</span>
                          {log.reset_physical_horometer && (
                            <span className="inline-flex w-fit px-1 py-0.5 rounded text-[8px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-wider">
                              Reset 0.0h
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="font-bold text-zinc-200">{log.machineName}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{log.machineSerial}</div>
                      </td>
                      <td className="py-4 px-2 font-mono">
                        {log.hours_at_maintenance.toFixed(1)}h
                      </td>
                      <td className="py-4 px-2">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                          passedCount === totalCount
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        }`}>
                          {passedCount} / {totalCount} Passed
                        </span>
                      </td>
                      <td className="py-4 px-2 max-w-xs truncate text-zinc-500" title={log.notes}>
                        {log.notes || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
