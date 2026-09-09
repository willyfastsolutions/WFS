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
  Search,
  Trash2
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

  // Table Filters State
  const [tableMachineId, setTableMachineId] = useState<string>("all");
  const [tableSearchQuery, setTableSearchQuery] = useState<string>("");
  const [isTableMachineDropdownOpen, setIsTableMachineDropdownOpen] = useState(false);

  const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : "";

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

        const token = sessionStorage.getItem("wfs_token") || "";

        // Fallback: Fetch settings from local DB
        const comps = mockDb.getCompanies();
        const targetComp = selectedCompanyId === "all" ? null : selectedCompanyId;
        const macs = mockDb.getMachinery(targetComp);
        const logs = mockDb.getMaintenanceLogs(targetComp);
        logs.sort((a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime());

        if (window.location.protocol === "file:") {
          setCompanies(comps);
          setMachinery(macs);
          setHistoryLogs(logs);
        }

        // Fetch actual settings from production API
        if (window.location.protocol !== "file:") {
          // Fetch companies
          fetch(`${API_BASE_URL}/api/companies/`, {
            headers: { "Authorization": `Bearer ${token}` }
          })
          .then(res => res.ok ? res.json() : [])
          .then(data => {
            if (Array.isArray(data)) setCompanies(data);
          })
          .catch(err => {
            console.warn("Could not sync companies from real API, using fallback:", err);
            setCompanies(comps);
          });

          // Fetch machinery
          fetch(`${API_BASE_URL}/api/machinery/`, {
            headers: { "Authorization": `Bearer ${token}` }
          })
          .then(res => res.ok ? res.json() : [])
          .then(data => {
            if (Array.isArray(data)) {
              const filtered = selectedCompanyId === "all"
                ? data
                : data.filter(m => m.company_id === selectedCompanyId);
              setMachinery(filtered);

              // Now fetch logs as they depend on the machinery list to map names & serials
              fetch(`${API_BASE_URL}/api/maintenance/logs`, {
                headers: { "Authorization": `Bearer ${token}` }
              })
              .then(res => res.ok ? res.json() : [])
              .then(logsData => {
                if (Array.isArray(logsData)) {
                  let filteredLogs = logsData;
                  if (selectedCompanyId !== "all") {
                    filteredLogs = logsData.filter(log => {
                      const machine = data.find(m => m.id === log.machinery_id);
                      return machine && machine.company_id === selectedCompanyId;
                    });
                  }
                  
                  const mappedLogs = filteredLogs.map(log => {
                    const machine = data.find(m => m.id === log.machinery_id);
                    return {
                      ...log,
                      machineName: machine ? machine.name : "Unknown Asset",
                      machineSerial: machine ? machine.serial_number : "N/A"
                    };
                  });
                  
                  mappedLogs.sort((a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime());
                  setHistoryLogs(mappedLogs);
                }
              })
              .catch(err => {
                console.warn("Could not sync maintenance logs from real API, using fallback:", err);
                setHistoryLogs(logs);
              });
            }
          })
          .catch(err => {
            console.warn("Could not sync machinery from real API, using fallback:", err);
            setMachinery(macs);
          });
        }
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
    
    // Fallback: Fetch templates matching company (or global)
    const allTemps = mockDb.getChecklistTemplates();
      // Merge Global and Company specific templates
      const globalTemps = allTemps.filter(t => t.company_id === null);
      const companyTemps = allTemps.filter(t => t.company_id === companyIdForTemplates);
      const temps = [...globalTemps, ...companyTemps];
    const tempIds = temps.map(t => t.id);
    const allItems = mockDb.getChecklistItems();
    const filteredItems = allItems.filter(item => tempIds.includes(item.template_id));

    if (typeof window !== "undefined" && window.location.protocol === "file:") {
      setActiveTemplates(temps);
      setActiveItems(filteredItems);

      // Initialize checklist selections
      const initialSelections: { [itemId: string]: boolean } = {};
      filteredItems.forEach(item => {
        initialSelections[item.id] = false;
      });
      setChecklistSelections(initialSelections);
    }

    // Live sync templates from production API
    if (typeof window !== "undefined" && window.location.protocol !== "file:") {
      const token = sessionStorage.getItem("wfs_token") || "";
      fetch(`${API_BASE_URL}/api/checklists/templates`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          const globalTempsReal = data.filter(t => t.company_id === null);
            const companyTempsReal = data.filter(t => t.company_id === companyIdForTemplates);
            const tempsReal = [...globalTempsReal, ...companyTempsReal];
          setActiveTemplates(tempsReal);
          
          const itemsList: any[] = [];
          tempsReal.forEach(temp => {
            if (temp.items) {
              itemsList.push(...temp.items);
            }
          });
          setActiveItems(itemsList);

          const initialSelectionsReal: { [itemId: string]: boolean } = {};
          itemsList.forEach(item => {
            initialSelectionsReal[item.id] = false;
          });
          setChecklistSelections(initialSelectionsReal);
        }
      })
      .catch(err => {
        console.warn("Could not sync templates from real API, using fallback:", err);
        setActiveTemplates(temps);
        setActiveItems(filteredItems);

        const initialSelections: { [itemId: string]: boolean } = {};
        filteredItems.forEach(item => {
          initialSelections[item.id] = false;
        });
        setChecklistSelections(initialSelections);
      });
    }
  }, [selectedMachineId, machinery, user]);

  const handleSelectMachine = (machine: Machine) => {
    setSelectedMachineId(machine.id);
    setHoursAtMaintenance(machine.current_hours);
    setIsMachineDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

      const payload = {
        machinery_id: selectedMachineId,
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
        reset_physical_horometer: resetPhysicalHorometer,
        checklist_results: checklistResults
      };

      // Live POST request to production API
      if (typeof window !== "undefined" && window.location.protocol !== "file:") {
        const token = sessionStorage.getItem("wfs_token") || "";
        const res = await fetch(`${API_BASE_URL}/api/maintenance/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.status === 401) {
          sessionStorage.removeItem("wfs_token");
          sessionStorage.removeItem("wfs_role");
          sessionStorage.removeItem("wfs_session");
          router.push("/login");
          setIsSubmitting(false);
          return;
        }

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Failed to submit maintenance log to server.");
        }
      }

      // Fallback: Sync locally to mockDb
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
    } catch (err: any) {
      console.error(err);
      setStatus({ type: "error", text: err.message || "Failed to record maintenance log." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!confirm("Are you sure you want to delete this maintenance record? This will recalculate the machine's last maintenance hours.")) {
      return;
    }
    
    setStatus(null);
    try {
      if (typeof window !== "undefined" && window.location.protocol !== "file:") {
        const token = sessionStorage.getItem("wfs_token") || "";
        const res = await fetch(`${API_BASE_URL}/api/maintenance/${logId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (res.status === 401) {
          sessionStorage.removeItem("wfs_token");
          sessionStorage.removeItem("wfs_role");
          sessionStorage.removeItem("wfs_session");
          router.push("/login");
          return;
        }
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Failed to delete maintenance log from server.");
        }
      }
      
      mockDb.deleteMaintenanceLog(logId);
      
      setStatus({ type: "success", text: "Maintenance log deleted successfully!" });
      refreshData();
    } catch (err: any) {
      console.error(err);
      setStatus({ type: "error", text: err.message || "Error deleting maintenance log." });
    }
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

  const filteredHistoryLogs = historyLogs.filter(log => {
    if (tableMachineId !== "all" && log.machinery_id !== tableMachineId) {
      return false;
    }
    if (tableSearchQuery) {
      const q = tableSearchQuery.toLowerCase();
      const matchName = log.machineName.toLowerCase().includes(q);
      const matchSerial = log.machineSerial.toLowerCase().includes(q);
      const matchNotes = (log.notes || "").toLowerCase().includes(q);
      if (!matchName && !matchSerial && !matchNotes) {
        return false;
      }
    }
    return true;
  });

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
                    onFocus={(e) => e.target.select()}
                    className="w-full h-10 px-3 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 transition-colors font-mono"
                  />
                </div>

              </div>

              {/* Dynamic Checklists Section */}
              {selectedMachineId && activeTemplates.length > 0 && (
                <div className="space-y-6 pt-4 border-t border-zinc-900">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Required Inspection Checklists</h4>
                      <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border w-fit ${
                        activeTemplates[0]?.company_id 
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-400" 
                          : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                      }`}>
                        {activeTemplates.some(t => t.company_id) ? "Global + Company Routine" : "Global Default Routine"}
                      </span>
                    </div>
                  
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
                      Reset Physical Horometer to 0.0
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-3">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <History className="h-4 w-4 text-zinc-400" /> Telemetry Audit History Log
          </h3>
          
          {/* Table Filters Panel */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Machine Filter Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTableMachineDropdownOpen(!isTableMachineDropdownOpen)}
                className="flex h-8 items-center justify-between rounded-lg border border-zinc-900 bg-zinc-950 px-2.5 text-[10px] font-semibold text-zinc-400 hover:border-zinc-800 hover:text-zinc-200 transition-all cursor-pointer gap-1.5"
              >
                <span>
                  {tableMachineId === "all"
                    ? "All machines"
                    : machinery.find(m => m.id === tableMachineId)?.name || "Machine"}
                </span>
                <ChevronDown className="h-3 w-3 text-zinc-550" />
              </button>
              
              {isTableMachineDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 rounded-lg border border-zinc-900 bg-zinc-950 p-1 shadow-2xl z-30 max-h-56 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setTableMachineId("all");
                      setIsTableMachineDropdownOpen(false);
                    }}
                    className={`flex w-full items-center px-2 py-1.5 text-left text-[10px] rounded hover:bg-zinc-900 transition-colors cursor-pointer ${
                      tableMachineId === "all" ? "text-zinc-200 bg-zinc-900/40" : "text-zinc-500"
                    }`}
                  >
                    All machines
                  </button>
                  {machinery.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setTableMachineId(m.id);
                        setIsTableMachineDropdownOpen(false);
                      }}
                      className={`flex w-full items-center px-2 py-1.5 text-left text-[10px] rounded hover:bg-zinc-900 transition-colors cursor-pointer ${
                        tableMachineId === m.id ? "text-zinc-200 bg-zinc-900/40" : "text-zinc-500"
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Search query input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-zinc-700" />
              <input
                type="text"
                placeholder="Buscar serial o nota..."
                value={tableSearchQuery}
                onChange={(e) => setTableSearchQuery(e.target.value)}
                className="h-8 pl-8 pr-3 rounded-lg border border-zinc-900 bg-zinc-950 text-[10px] text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 w-44"
              />
            </div>
          </div>
        </div>

        {filteredHistoryLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500 font-mono">
            No hay registros de mantenimiento que coincidan.
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
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                {filteredHistoryLogs.map(log => {
                  // Fetch dynamic results (prefer production real results if available)
                  const results = (log.checklist_results && log.checklist_results.length > 0)
                    ? log.checklist_results
                    : mockDb.getMaintenanceChecklistResults(log.id);
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
                      <td className="py-4 px-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1.5 rounded-lg border border-zinc-900 bg-zinc-950 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all cursor-pointer inline-flex items-center justify-center"
                          title="Eliminar registro de mantenimiento"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
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
