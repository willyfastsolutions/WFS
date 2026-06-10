"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  PlusCircle, 
  Wrench, 
  Activity, 
  Clock, 
  Building,
  Check,
  ChevronDown,
  Info
} from "lucide-react";
import { Profile, Company, Machine, mockDb } from "../mockDb";

export default function RegisterMachinery() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  // Form States
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serial, setSerial] = useState("");
  const [initialHours, setInitialHours] = useState<string>("0");
  const [targetCompanyId, setTargetCompanyId] = useState("");
  const [machineType, setMachineType] = useState<Machine["type"]>("forklift");

  // Custom Dropdown Open States (NO native select)
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);

  // Status message
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    mockDb.initialize();
    if (typeof window !== "undefined") {
      const sessionStr = sessionStorage.getItem("wfs_session");
      if (sessionStr) {
        const profile = JSON.parse(sessionStr) as Profile;
        setUser(profile);
        
        if (profile.role === "superadmin") {
          const comps = mockDb.getCompanies();
          setCompanies(comps);
          if (comps.length > 0) setTargetCompanyId(comps[0].id);
        } else {
          setTargetCompanyId(profile.company_id || "");
        }
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    
    if (!name || !brand || !model || !serial || !targetCompanyId) {
      setStatus({ type: "error", text: "Please fill out all required fields." });
      return;
    }

    const hours = Number(initialHours);
    if (isNaN(hours) || hours < 0) {
      setStatus({ type: "error", text: "Initial hours must be a non-negative number." });
      return;
    }

    if (hours > 250) {
      setStatus({ type: "error", text: "Initial hours cannot exceed 250 hours (Maximum safety threshold limit)." });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        mockDb.addMachine({
          company_id: targetCompanyId,
          name: name,
          type: machineType,
          brand: brand,
          model: model,
          serial_number: serial,
          current_hours: hours,
          maintenance_threshold_hours: 250.0,
          last_maintenance_hours: 0.0
        });

        setStatus({ type: "success", text: "Machine registered successfully! Redirecting to fleet inventory..." });
        
        // Reset form
        setName("");
        setBrand("");
        setModel("");
        setSerial("");
        setInitialHours("0");
        
        setTimeout(() => {
          if (typeof window !== "undefined" && window.location.protocol === "file:") {
            window.location.href = "../index.html";
          } else {
            router.push("/dashboard");
          }
        }, 1500);
      } catch (err) {
        setStatus({ type: "error", text: "Failed to save machine. Please verify data formats." });
      } finally {
        setIsSubmitting(false);
      }
    }, 1000);
  };

  const machineTypes: { value: Machine["type"]; label: string; desc: string }[] = [
    { value: "forklift", label: "Industrial Forklift", desc: "Warehouse, load lift stability checks" },
    { value: "excavator", label: "Hydraulic Excavator", desc: "Heavy civil, digging pressure wear checks" },
    { value: "skid_steer_loader", label: "Skid Steer Loader", desc: "Bobcats, loader linkage wear check" }
  ];

  const selectedTypeLabel = machineTypes.find(t => t.value === machineType)?.label || "Industrial Forklift";
  const selectedCompanyName = companies.find(c => c.id === targetCompanyId)?.name || "Select Company";

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
          <PlusCircle className="h-6 w-6 text-zinc-400" /> Register New Machinery
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Add new operational assets into the B2B fleet telemetry network.
        </p>
      </div>

      {/* Status Messages */}
      {status && (
        <div className={`p-4 rounded-lg text-xs border transition-all duration-300 ${
          status.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
        }`}>
          {status.text}
        </div>
      )}

      {/* Main Registration Form */}
      <div className="border border-zinc-900 bg-zinc-900/10 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Machine Name */}
          <div className="space-y-1.5">
            <label htmlFor="mach-name" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Asset Name / Tag</label>
            <input
              type="text"
              id="mach-name"
              placeholder="e.g. Apex Forklift 3"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 transition-colors"
            />
          </div>

          {/* Machine Type - Custom Dropdown (No native select) */}
          <div className="space-y-1.5 relative">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Equipment Classification</label>
            <button
              type="button"
              onClick={() => {
                setIsTypeDropdownOpen(!isTypeDropdownOpen);
                setIsCompanyDropdownOpen(false);
              }}
              className="flex w-full h-10 items-center justify-between rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-sm text-zinc-300 hover:border-zinc-850 transition-all cursor-pointer"
            >
              <span>{selectedTypeLabel}</span>
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            </button>

            {isTypeDropdownOpen && (
              <div className="absolute left-0 mt-1 w-full rounded-lg border border-zinc-900 bg-zinc-950 p-1 shadow-2xl z-30">
                {machineTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setMachineType(type.value);
                      setIsTypeDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left rounded-md hover:bg-zinc-900 transition-colors cursor-pointer ${
                      machineType === type.value ? "bg-zinc-900/60 text-zinc-100" : "text-zinc-400"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold">{type.label}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{type.desc}</div>
                    </div>
                    {machineType === type.value && <Check className="h-3.5 w-3.5 text-zinc-200" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Brand, Model, Serial Number Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="space-y-1.5">
              <label htmlFor="mach-brand" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Manufacturer</label>
              <input
                type="text"
                id="mach-brand"
                placeholder="e.g. Toyota"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="mach-model" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Model</label>
              <input
                type="text"
                id="mach-model"
                placeholder="e.g. 8FGU25"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="mach-serial" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Serial Number</label>
              <input
                type="text"
                id="mach-serial"
                placeholder="e.g. SN-TOY-100234"
                required
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 transition-colors font-mono"
              />
            </div>

          </div>

          {/* Initial Hours & Company Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Initial Hours */}
            <div className="space-y-1.5">
              <label htmlFor="mach-hours" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Initial Hours</label>
              <input
                type="number"
                id="mach-hours"
                step="0.1"
                required
                value={initialHours}
                onChange={(e) => setInitialHours(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 transition-colors font-mono"
              />
            </div>

            {/* Target Company (Selectable for Superadmin, locked for Company Admin) */}
            <div className="space-y-1.5 relative">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Assign to B2B Company</label>
              
              {user?.role === "superadmin" ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCompanyDropdownOpen(!isCompanyDropdownOpen);
                      setIsTypeDropdownOpen(false);
                    }}
                    className="flex w-full h-10 items-center justify-between rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-sm text-zinc-300 hover:border-zinc-850 transition-all cursor-pointer"
                  >
                    <span>{selectedCompanyName}</span>
                    <ChevronDown className="h-4 w-4 text-zinc-500" />
                  </button>

                  {isCompanyDropdownOpen && (
                    <div className="absolute left-0 mt-1 w-full rounded-lg border border-zinc-900 bg-zinc-950 p-1 shadow-2xl z-30">
                      {companies.map((comp) => (
                        <button
                          key={comp.id}
                          type="button"
                          onClick={() => {
                            setTargetCompanyId(comp.id);
                            setIsCompanyDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between px-3 py-2 text-left rounded-md hover:bg-zinc-900 transition-colors cursor-pointer text-xs font-semibold ${
                            targetCompanyId === comp.id ? "bg-zinc-900/60 text-zinc-100" : "text-zinc-400"
                          }`}
                        >
                          {comp.name}
                          {targetCompanyId === comp.id && <Check className="h-3.5 w-3.5 text-zinc-200" />}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-10 w-full items-center rounded-lg border border-zinc-900 bg-zinc-900/40 px-3 text-xs text-zinc-500 font-semibold select-none">
                  <Building className="h-3.5 w-3.5 text-zinc-600 mr-2" />
                  Apex Logistics Corp (Locked Tenant)
                </div>
              )}
            </div>

          </div>

          {/* Informational Warning */}
          <div className="p-3.5 rounded-lg border border-zinc-900 bg-zinc-950/40 flex items-start gap-3">
            <Info className="h-4 w-4 text-zinc-500 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              <strong>Audit Safety Threshold:</strong> All newly added machinery will default to a <strong>250.0 hour</strong> maintenance limit interval. If initial hours exceed this threshold, the system daemon will trigger a preventive maintenance warning.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex h-11 items-center justify-center rounded-lg bg-zinc-100 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-zinc-100 transition-all shadow-md cursor-pointer"
          >
            {isSubmitting ? "Registering Asset..." : "Register Machinery"}
          </button>

        </form>
      </div>

    </div>
  );
}
