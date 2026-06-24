"use client";

import React, { useEffect, useState } from "react";
import { 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  Plus, 
  PlusCircle,
  Trash2, 
  Clock, 
  Filter,
  CheckCircle,
  FileText,
  Search,
  Wrench,
  ChevronDown,
  Edit2,
  Camera,
  X
} from "lucide-react";
import { Profile, Company, Machine, mockDb } from "./mockDb";

export default function FleetOverview() {
  const [user, setUser] = useState<Profile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [machinery, setMachinery] = useState<Machine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState("");

  // Modal States
  const [hoursModalMachine, setHoursModalMachine] = useState<Machine | null>(null);
  const [newHoursValue, setNewHoursValue] = useState<number>(0);
  const [hoursModalError, setHoursModalError] = useState<string | null>(null);

  const [revokeModalMachine, setRevokeModalMachine] = useState<Machine | null>(null);
  const [revokePassword, setRevokePassword] = useState("");
  const [revokeError, setRevokeError] = useState<string | null>(null);

  // Edit Modal States
  const [editModalMachine, setEditModalMachine] = useState<Machine | null>(null);
  const [editName, setEditName] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editSerial, setEditSerial] = useState("");
  const [editPhoto, setEditPhoto] = useState<string | null>(null);
  
  // Edit Modal Webcam States
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const editVideoRef = React.useRef<HTMLVideoElement>(null);
  const editFileInputRef = React.useRef<HTMLInputElement>(null);

  const startWebcam = async () => {
    setIsWebcamOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 }
      });
      setWebcamStream(stream);
      setTimeout(() => {
        if (editVideoRef.current) {
          editVideoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Failed to access webcam:", err);
      setIsWebcamOpen(false);
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
    setIsWebcamOpen(false);
  };

  const captureWebcamPhoto = () => {
    if (editVideoRef.current) {
      const video = editVideoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setEditPhoto(canvas.toDataURL("image/png"));
      }
      stopWebcam();
    }
  };

  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [webcamStream]);

  const openEditModal = (machine: Machine) => {
    setEditModalMachine(machine);
    setEditName(machine.name);
    setEditBrand(machine.brand);
    setEditModel(machine.model);
    setEditSerial(machine.serial_number);
    setEditPhoto(machine.photo || null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalMachine) return;

    const isOffline = typeof window !== "undefined" && window.location.protocol === "file:";
    const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : "";

    if (!isOffline) {
      try {
        const token = sessionStorage.getItem("wfs_token");
        const response = await fetch(`${API_BASE_URL}/api/machinery/${editModalMachine.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            name: editName,
            brand: editBrand,
            model: editModel,
            serial_number: editSerial,
            photo: editPhoto || null
          }),
        });

        if (response.ok) {
          const updated = await response.json() as Machine;
          mockDb.updateMachine(editModalMachine.id, updated);
          setEditModalMachine(null);
          refreshData();
          return;
        } else {
          const errData = await response.json();
          alert(errData.detail || "Failed to save updates to database.");
          return;
        }
      } catch (err) {
        console.error("API update machine failed, using mock fallback:", err);
      }
    }

    const success = mockDb.updateMachine(editModalMachine.id, {
      name: editName,
      brand: editBrand,
      model: editModel,
      serial_number: editSerial,
      photo: editPhoto || undefined
    });
    if (success) {
      setEditModalMachine(null);
      refreshData();
    }
  };

  // Fetch Session & Data
  const refreshData = async () => {
    if (typeof window !== "undefined") {
      const sessionStr = sessionStorage.getItem("wfs_session");
      if (sessionStr) {
        const profile = JSON.parse(sessionStr) as Profile;
        setUser(profile);
        
        const isOffline = window.location.protocol === "file:";
        const API_BASE_URL = (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
          ? `${window.location.protocol}//${window.location.hostname}:8000`
          : "";

        if (!isOffline) {
          try {
            const token = sessionStorage.getItem("wfs_token");
            
            // 1. Fetch companies
            if (profile.role === "superadmin") {
              const compsResponse = await fetch(`${API_BASE_URL}/api/companies/`, {
                headers: { "Authorization": `Bearer ${token}` }
              });
              if (compsResponse.ok) {
                const comps = await compsResponse.json() as Company[];
                setCompanies(comps);
                mockDb.setCompanies(comps);
              }
            }

            // 2. Fetch machinery
            let machineryUrl = `${API_BASE_URL}/api/machinery/`;
            if (profile.role !== "superadmin") {
              machineryUrl += `?company_id=${profile.company_id}`;
            } else if (selectedCompanyId !== "all") {
              machineryUrl += `?company_id=${selectedCompanyId}`;
            }
            
            const macsResponse = await fetch(machineryUrl, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            
            if (macsResponse.ok) {
              const macs = await macsResponse.json() as Machine[];
              setMachinery(macs);
              mockDb.setMachinery(macs);
              return;
            }
          } catch (err) {
            console.warn("Could not fetch dashboard data from API, using mockDb fallback:", err);
          }
        }

        // Fallback to mockDb
        if (profile.role === "superadmin") {
          const comps = mockDb.getCompanies();
          setCompanies(comps);
          const macs = mockDb.getMachinery(selectedCompanyId === "all" ? null : selectedCompanyId, true);
          setMachinery(macs);
        } else {
          const macs = mockDb.getMachinery(profile.company_id, false);
          setMachinery(macs);
        }
      }
    }
  };

  useEffect(() => {
    mockDb.initialize();
    refreshData();
  }, [selectedCompanyId]);

  const handleLogHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoursModalMachine || !user) return;
    
    if (newHoursValue < hoursModalMachine.current_hours) {
      setHoursModalError(`New hours cannot be less than current hours (${hoursModalMachine.current_hours} hrs).`);
      return;
    }

    const isOffline = typeof window !== "undefined" && window.location.protocol === "file:";
    const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : "";

    if (!isOffline) {
      try {
        const token = sessionStorage.getItem("wfs_token");
        const response = await fetch(`${API_BASE_URL}/api/machinery/${hoursModalMachine.id}/hours`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ hours: newHoursValue })
        });
        if (response.ok) {
          // Sync local mockDb
          mockDb.logHours(hoursModalMachine.id, newHoursValue, user.id);
          setHoursModalMachine(null);
          setHoursModalError(null);
          refreshData();
          return;
        } else {
          const errData = await response.json();
          setHoursModalError(errData.detail || "Failed to update hours in backend database.");
          return;
        }
      } catch (err) {
        console.error("API error, falling back to mockDb:", err);
      }
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

  const handleRevokeSubmit = async () => {
    if (!revokeModalMachine) return;
    if (revokePassword !== "admin1234") {
      setRevokeError("Incorrect password. Re-authentication failed.");
      return;
    }

    const success = mockDb.deleteMachine(revokeModalMachine.id);
    if (success) {
      // If online (server mode), try to delete in backend database too
      if (typeof window !== "undefined" && window.location.protocol !== "file:") {
        const API_BASE_URL = (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
          ? `${window.location.protocol}//${window.location.hostname}:8000`
          : "";
        
        await fetch(`${API_BASE_URL}/api/machinery/${revokeModalMachine.id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("wfs_token") || ""}`
          }
        }).catch(err => console.warn("Failed to delete machine in real API:", err));
      }

      setRevokeModalMachine(null);
      setRevokePassword("");
      setRevokeError(null);
      refreshData();
    }
  };

  const handleReactivateMachine = async (machineId: string) => {
    const success = mockDb.reactivateMachine(machineId);
    if (success) {
      // If online (server mode), try to reactivate in backend database too
      if (typeof window !== "undefined" && window.location.protocol !== "file:") {
        const API_BASE_URL = (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
          ? `${window.location.protocol}//${window.location.hostname}:8000`
          : "";
        
        await fetch(`${API_BASE_URL}/api/machinery/${machineId}/reactivate`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("wfs_token") || ""}`
          }
        }).catch(err => console.warn("Failed to reactivate machine in real API:", err));
      }
      refreshData();
    }
  };

  // Calculations for KPIs (Active machines only)
  const activeMachinery = machinery.filter(m => !m.revoked);
  const totalFleetSize = activeMachinery.length;
  const overdueMaintenanceCount = activeMachinery.filter(m => {
    const hoursSinceLast = m.current_hours - m.last_maintenance_hours;
    return hoursSinceLast >= m.maintenance_threshold_hours;
  }).length;

  const averageHours = totalFleetSize > 0 
    ? Math.round(activeMachinery.reduce((acc, m) => acc + m.current_hours, 0) / totalFleetSize)
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
                className={`border bg-zinc-900/10 transition-all rounded-xl overflow-hidden flex flex-col justify-between gap-6 relative group ${
                  mac.revoked 
                    ? "border-rose-950/40 opacity-70 bg-rose-950/5" 
                    : "border-zinc-900 hover:border-zinc-800/80"
                }`}
              >
                {mac.photo && (
                  <div className="h-36 w-full border-b border-zinc-900 overflow-hidden bg-zinc-950 relative">
                    <img src={mac.photo} alt={mac.name} className={`w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-300 ${mac.revoked ? "grayscale" : ""}`} />
                    {mac.revoked && (
                      <div className="absolute inset-0 bg-rose-950/20 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded uppercase font-mono">Revoked / Inactive</span>
                      </div>
                    )}
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
                        <h4 className={`text-sm font-bold ${mac.revoked ? "text-zinc-500 line-through" : "text-zinc-200"}`}>{mac.name}</h4>
                        <div className="text-[10px] text-zinc-500 mt-0.5 capitalize">{mac.brand} {mac.model}</div>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    {mac.revoked ? (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border bg-rose-500/15 border-rose-500/30 text-rose-400 uppercase font-mono">
                        Revoked
                      </div>
                    ) : (
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        isOverdue 
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse" 
                          : "bg-zinc-800 border-zinc-800 text-zinc-400"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isOverdue ? "bg-rose-500" : "bg-zinc-500"}`} />
                        {isOverdue ? "OVERDUE" : "OK"}
                      </div>
                    )}
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
                        <span className="truncate block font-semibold text-zinc-400">
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
                      className={`h-full rounded-full transition-all duration-500 ${mac.revoked ? "bg-rose-950" : (isOverdue ? "bg-rose-500" : "bg-zinc-400")}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons Row */}
                {mac.revoked ? (
                  <div className="flex items-center gap-2 border-t border-zinc-900 pt-3.5 w-full">
                    {user?.role === "superadmin" && (
                      <button
                        onClick={() => handleReactivateMachine(mac.id)}
                        className="flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-950 bg-emerald-950/20 text-xs font-semibold text-emerald-400 hover:bg-emerald-900/10 hover:border-emerald-850 transition-all cursor-pointer"
                      >
                        <PlusCircle className="h-3.5 w-3.5" /> Reactivate Asset
                      </button>
                    )}
                  </div>
                ) : (
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
                      onClick={() => openEditModal(mac)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-950 text-xs font-semibold text-zinc-500 hover:bg-zinc-900 hover:border-zinc-800 hover:text-zinc-350 transition-all cursor-pointer"
                      title="Edit Machine Details"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => setRevokeModalMachine(mac)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-950 text-xs font-semibold text-zinc-500 hover:bg-rose-500/5 hover:border-rose-500/20 hover:text-rose-400 transition-all cursor-pointer"
                      aria-label="Revoke Machine"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
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
                Are you sure you want to revoke/delete <span className="text-zinc-300 font-semibold">{revokeModalMachine.name}</span>? This action will temporarily remove this machine from the active company fleet registry.
              </p>
            </div>

            {revokeError && (
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-400">
                {revokeError}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="revoke-password-input" className="text-[10px] uppercase font-bold text-zinc-500">Re-enter Admin Password (admin1234)</label>
              <input
                type="password"
                id="revoke-password-input"
                required
                value={revokePassword}
                onChange={(e) => {
                  setRevokePassword(e.target.value);
                  setRevokeError(null);
                }}
                placeholder="••••••••"
                className="w-full h-10 px-3 rounded-lg border border-zinc-900 bg-zinc-900/40 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 transition-colors font-mono"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => {
                  setRevokeModalMachine(null);
                  setRevokePassword("");
                  setRevokeError(null);
                }}
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

      {/* Edit Machine Modal Overlay */}
      {editModalMachine && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-md rounded-xl shadow-2xl p-6 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                <Edit2 className="h-4 w-4 text-zinc-400" /> Edit Machinery Details
              </h3>
              <button
                type="button"
                onClick={() => setEditModalMachine(null)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              
              {/* Asset Name */}
              <div className="space-y-1.5">
                <label htmlFor="edit-name" className="text-[10px] uppercase font-bold text-zinc-500">Asset Name / Tag</label>
                <input
                  type="text"
                  id="edit-name"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-900 bg-zinc-900/30 text-sm text-zinc-200 focus:outline-none focus:border-zinc-800 transition-colors"
                />
              </div>

              {/* Brand & Model */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="edit-brand" className="text-[10px] uppercase font-bold text-zinc-500">Brand</label>
                  <input
                    type="text"
                    id="edit-brand"
                    required
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-zinc-900 bg-zinc-900/30 text-sm text-zinc-200 focus:outline-none focus:border-zinc-800 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="edit-model" className="text-[10px] uppercase font-bold text-zinc-500">Model</label>
                  <input
                    type="text"
                    id="edit-model"
                    required
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-zinc-900 bg-zinc-900/30 text-sm text-zinc-200 focus:outline-none focus:border-zinc-800 transition-colors"
                  />
                </div>
              </div>

              {/* Serial Number */}
              <div className="space-y-1.5">
                <label htmlFor="edit-serial" className="text-[10px] uppercase font-bold text-zinc-500">Serial Number</label>
                <input
                  type="text"
                  id="edit-serial"
                  required
                  value={editSerial}
                  onChange={(e) => setEditSerial(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-900 bg-zinc-900/30 text-sm text-zinc-200 focus:outline-none focus:border-zinc-800 transition-colors font-mono"
                />
              </div>

              {/* Photo Upload / Webcam */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Asset Photo</label>
                
                <div className="flex gap-4 items-center">
                  <div 
                    onClick={() => editFileInputRef.current?.click()}
                    className="flex-1 h-24 border border-dashed border-zinc-850 bg-zinc-900/10 hover:bg-zinc-900/20 hover:border-zinc-800 transition-all rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer p-2 relative group overflow-hidden"
                  >
                    {editPhoto ? (
                      <>
                        <img src={editPhoto} alt="Edit Preview" className="w-full h-full object-cover rounded-md" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-semibold text-zinc-200">
                          Change Photo
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-[10px] text-zinc-400 font-medium">Browse file</div>
                        <div className="text-[8px] text-zinc-650">JPG, PNG up to 2MB</div>
                      </>
                    )}
                  </div>

                  {/* Camera Button */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      onClick={startWebcam}
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-855 bg-zinc-950 text-zinc-400 hover:border-zinc-850 hover:text-zinc-200 transition-all active:scale-95 cursor-pointer"
                      title="Take Photo with Camera"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                    <span className="text-[8px] uppercase font-bold text-zinc-500 font-semibold tracking-wider">Webcam</span>
                  </div>
                </div>

                {/* Hidden File Input for Edit */}
                <input 
                  type="file"
                  ref={editFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setEditPhoto(event.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                {editPhoto && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setEditPhoto(null)}
                      className="text-[9px] text-rose-400 hover:underline cursor-pointer"
                    >
                      Remove Photo
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setEditModalMachine(null)}
                  className="inline-flex h-9 items-center justify-center px-4 rounded-lg border border-zinc-900 bg-zinc-950 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center px-4 rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Webcam Capture Overlay Modal */}
      {isWebcamOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-900 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">Live Webcam</h3>
              <button 
                type="button" 
                onClick={stopWebcam} 
                className="text-zinc-550 hover:text-zinc-300 text-xs"
              >
                Close
              </button>
            </div>
            
            {/* Video Feed */}
            <div className="bg-black aspect-video relative flex items-center justify-center overflow-hidden">
              <video 
                ref={editVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Control Bar */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex justify-between gap-4">
              <button
                type="button"
                onClick={stopWebcam}
                className="flex-1 h-10 rounded-lg border border-zinc-900 bg-zinc-950 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={captureWebcamPhoto}
                className="flex-1 h-10 rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Camera className="h-4 w-4" /> Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
