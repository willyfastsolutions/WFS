"use client";

import React, { useEffect, useState } from "react";
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
  Info
} from "lucide-react";
import { Profile, Machine, MaintenanceLog, mockDb } from "../mockDb";

export default function MaintenancePortal() {
  const [user, setUser] = useState<Profile | null>(null);
  const [machinery, setMachinery] = useState<Machine[]>([]);
  const [historyLogs, setHistoryLogs] = useState<(MaintenanceLog & { machineName: string; machineSerial: string })[]>([]);

  // Form States
  const [selectedMachineId, setSelectedMachineId] = useState("");
  const [hoursAtMaintenance, setHoursAtMaintenance] = useState<number>(0);
  const [notes, setNotes] = useState("");

  // Checklists (States)
  const [oilChange, setOilChange] = useState(false);
  const [oilFilter, setOilFilter] = useState(false);
  const [airFilter, setAirFilter] = useState(false);
  const [sparkPlugs, setSparkPlugs] = useState(false);

  const [safetyBattery, setSafetyBattery] = useState(false);
  const [safetyLights, setSafetyLights] = useState(false);
  const [safetyHorn, setSafetyHorn] = useState(false);
  const [safetyIgnition, setSafetyIgnition] = useState(false);
  const [safetyFuel, setSafetyFuel] = useState(false);
  const [safetyTires, setSafetyTires] = useState(false);

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

        // Fetch company specific machinery and logs
        const macs = mockDb.getMachinery(profile.company_id);
        setMachinery(macs);

        const logs = mockDb.getMaintenanceLogs(profile.company_id);
        // Sort history by date descending
        logs.sort((a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime());
        setHistoryLogs(logs);
      }
    }
  };

  useEffect(() => {
    mockDb.initialize();
    refreshData();
  }, []);

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

    if (hoursAtMaintenance < machine.last_maintenance_hours) {
      setStatus({ type: "error", text: `Hours at maintenance cannot be less than last maintenance (${machine.last_maintenance_hours} hrs).` });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        mockDb.performMaintenance({
          machinery_id: selectedMachineId,
          performed_by: user.id,
          hours_at_maintenance: hoursAtMaintenance,
          oil_change: oilChange,
          oil_filter_change: oilFilter,
          air_filter_change: airFilter,
          spark_glow_plugs_change: sparkPlugs,
          safety_battery: safetyBattery,
          safety_lights: safetyLights,
          safety_horn: safetyHorn,
          safety_ignition: safetyIgnition,
          safety_fuel: safetyFuel,
          safety_tires: safetyTires,
          notes: notes
        });

        setStatus({ type: "success", text: "Preventive maintenance log submitted successfully! Telemetry hours reset." });
        
        // Reset form
        setSelectedMachineId("");
        setHoursAtMaintenance(0);
        setNotes("");
        setOilChange(false);
        setOilFilter(false);
        setAirFilter(false);
        setSparkPlugs(false);
        setSafetyBattery(false);
        setSafetyLights(false);
        setSafetyHorn(false);
        setSafetyIgnition(false);
        setSafetyFuel(false);
        setSafetyTires(false);

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

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
          <Wrench className="h-6 w-6 text-zinc-400" /> Maintenance Portal
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Complete mandatory safety checklists, record services, and review historical logs.
        </p>
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

              {/* Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-900">
                
                {/* Checklist column 1: Routine Services */}
                <div className="space-y-3.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Routine Services Checklist</h4>
                  
                  {/* Item 1 */}
                  <label className="flex items-center gap-3 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={oilChange}
                      onChange={(e) => setOilChange(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-zinc-200 focus:ring-0 focus:ring-offset-0 focus:outline-none accent-zinc-200"
                    />
                    Engine / Hydraulic Oil Change
                  </label>

                  {/* Item 2 */}
                  <label className="flex items-center gap-3 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={oilFilter}
                      onChange={(e) => setOilFilter(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-zinc-200 focus:ring-0 focus:ring-offset-0 focus:outline-none accent-zinc-200"
                    />
                    Oil Filter Replacement
                  </label>

                  {/* Item 3 */}
                  <label className="flex items-center gap-3 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={airFilter}
                      onChange={(e) => setAirFilter(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-zinc-200 focus:ring-0 focus:ring-offset-0 focus:outline-none accent-zinc-200"
                    />
                    Air Filter Replacement
                  </label>

                  {/* Item 4 */}
                  <label className="flex items-center gap-3 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={sparkPlugs}
                      onChange={(e) => setSparkPlugs(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-zinc-200 focus:ring-0 focus:ring-offset-0 focus:outline-none accent-zinc-200"
                    />
                    Spark / Glow Plugs Check
                  </label>
                </div>

                {/* Checklist column 2: Advanced Safety Checks */}
                <div className="space-y-3.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Safety Verification Check (OSHA)</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    
                    <label className="flex items-center gap-2.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={safetyBattery}
                        onChange={(e) => setSafetyBattery(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-zinc-200 accent-zinc-200"
                      />
                      Batteries
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={safetyLights}
                        onChange={(e) => setSafetyLights(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-zinc-200 accent-zinc-200"
                      />
                      Working Lights
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={safetyHorn}
                        onChange={(e) => setSafetyHorn(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-zinc-200 accent-zinc-200"
                      />
                      Horn / Alarms
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={safetyIgnition}
                        onChange={(e) => setSafetyIgnition(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-zinc-200 accent-zinc-200"
                      />
                      Ignition System
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={safetyFuel}
                        onChange={(e) => setSafetyFuel(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-zinc-200 accent-zinc-200"
                      />
                      Fuel Injection
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={safetyTires}
                        onChange={(e) => setSafetyTires(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-zinc-200 accent-zinc-200"
                      />
                      Tires / Connectors
                    </label>

                  </div>
                </div>

              </div>

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
                {isSubmitting ? "Submitting Log Checklist..." : "Complete & Reset Horómetro"}
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
                  <th className="py-3 px-2">Services Checked</th>
                  <th className="py-3 px-2">Safety checks</th>
                  <th className="py-3 px-2">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                {historyLogs.map(log => {
                  const servicesChecked = [
                    log.oil_change && "Oil",
                    log.oil_filter_change && "Oil Filter",
                    log.air_filter_change && "Air Filter",
                    log.spark_glow_plugs_change && "Plugs"
                  ].filter(Boolean).join(", ") || "None";

                  const safetyCount = [
                    log.safety_battery,
                    log.safety_lights,
                    log.safety_horn,
                    log.safety_ignition,
                    log.safety_fuel,
                    log.safety_tires
                  ].filter(Boolean).length;

                  return (
                    <tr key={log.id} className="hover:bg-zinc-900/20 transition-colors">
                      <td className="py-4 px-2 whitespace-nowrap text-zinc-400 font-mono">
                        {new Date(log.performed_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-2">
                        <div className="font-bold text-zinc-200">{log.machineName}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{log.machineSerial}</div>
                      </td>
                      <td className="py-4 px-2 font-mono">{log.hours_at_maintenance.toFixed(1)}h</td>
                      <td className="py-4 px-2 text-zinc-400">{servicesChecked}</td>
                      <td className="py-4 px-2">
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          {safetyCount} / 6 Passed
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
