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
  Info,
  Camera
} from "lucide-react";
import { Profile, Company, Machine, mockDb } from "../mockDb";
import { compressImage } from "../imageUtils";

export default function RegisterMachinery() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyName, setCompanyName] = useState("");
  
  // Form States
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serial, setSerial] = useState("");
  const [initialHours, setInitialHours] = useState<string>("0");
  const [targetCompanyId, setTargetCompanyId] = useState("");
  const [machineType, setMachineType] = useState<Machine["type"]>("forklift");
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    setIsCameraModalOpen(true);
    setStatus(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment", width: 640, height: 480 } 
      });
      setCameraStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Failed to access camera:", err);
      setStatus({ type: "error", text: "Could not access camera. Please check permissions." });
      setIsCameraModalOpen(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraModalOpen(false);
  };

  const capturePhoto = async () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const raw = canvas.toDataURL("image/jpeg", 0.85);
        try {
          const compressed = await compressImage(raw, 1024, 1024, 0.75);
          setPhoto(compressed);
        } catch (err) {
          setPhoto(raw);
        }
      }
      stopCamera();
    }
  };

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Custom Dropdown Open States (NO native select)
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);

  // Status message
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maxHours, setMaxHours] = useState(250);

  useEffect(() => {
    mockDb.initialize();
    
    async function loadData() {
      if (typeof window === "undefined") return;
      
      const settings = mockDb.getSystemSettings();
      setMaxHours(settings.default_maintenance_threshold);
      
      const sessionStr = sessionStorage.getItem("wfs_session");
      if (!sessionStr) return;
      
      const profile = JSON.parse(sessionStr) as Profile;
      setUser(profile);
      
      if (profile.role === "superadmin") {
        const isOffline = window.location.protocol === "file:";
        const API_BASE_URL = (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
          ? `${window.location.protocol}//${window.location.hostname}:8000`
          : "";

        if (!isOffline) {
          try {
            const token = sessionStorage.getItem("wfs_token");
            const response = await fetch(`${API_BASE_URL}/api/companies/`, {
              headers: {
                "Authorization": `Bearer ${token}`
              }
            });
            if (response.status === 401) {
              sessionStorage.removeItem("wfs_token");
              sessionStorage.removeItem("wfs_role");
              sessionStorage.removeItem("wfs_session");
              router.push("/login");
              return;
            }
            if (response.ok) {
              const data = await response.json() as Company[];
              setCompanies(data);
              mockDb.setCompanies(data);
              if (data.length > 0) setTargetCompanyId(data[0].id);
              return;
            }
          } catch (err) {
            console.warn("Could not fetch companies from API in register machinery, using mockDb fallback:", err);
          }
        }
        
        const comps = mockDb.getCompanies();
        setCompanies(comps);
        if (comps.length > 0) setTargetCompanyId(comps[0].id);
      } else {
        const compId = profile.company_id || "";
        setTargetCompanyId(compId);
        if (compId) {
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
                  // Sincronizar localmente en mockDb para consistencia
                  mockDb.addCompany(data);
                } catch (e) {}
              }
            })
            .catch(err => {
              console.warn("Could not fetch company details from API:", err);
            });
          }
        }
      }
    }
    
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
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

    // Removed frontend initial hours limit check to allow real machinery with high initial hours.

    setIsSubmitting(true);

    const isOffline = typeof window !== "undefined" && window.location.protocol === "file:";
    const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : "";

    if (!isOffline) {
      const token = sessionStorage.getItem("wfs_token");
      if (!token) {
        sessionStorage.removeItem("wfs_role");
        sessionStorage.removeItem("wfs_session");
        router.push("/login");
        return;
      }

      const payload = {
        company_id: targetCompanyId,
        name: name,
        type: machineType,
        brand: brand,
        model: model,
        serial_number: serial,
        current_hours: hours,
        maintenance_threshold_hours: maxHours,
        photo: photo || null
      };

      // Resilient request with 20s timeout and 1 automatic retry on network failure
      const sendRequest = async (attempt: number): Promise<Response> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);
        try {
          const res = await fetch(`${API_BASE_URL}/api/machinery/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          return res;
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          if (attempt === 1) {
            await new Promise(r => setTimeout(r, 1200));
            return sendRequest(2);
          }
          throw fetchErr;
        }
      };

      try {
        const response = await sendRequest(1);

        if (response.status === 401) {
          sessionStorage.removeItem("wfs_token");
          sessionStorage.removeItem("wfs_role");
          sessionStorage.removeItem("wfs_session");
          router.push("/login");
          return;
        }

        if (response.ok) {
          // Sync to mockDb locally for dashboard view consistency
          try {
            mockDb.addMachine({
              company_id: targetCompanyId,
              name: name,
              type: machineType,
              brand: brand,
              model: model,
              serial_number: serial,
              current_hours: hours,
              maintenance_threshold_hours: maxHours,
              last_maintenance_hours: hours,
              photo: photo || undefined
            });
          } catch (mockErr) {
            console.error("mockDb sync failed:", mockErr);
          }

          setStatus({ type: "success", text: "Asset registered successfully on central database! Redirecting to fleet inventory..." });
          
          setName("");
          setBrand("");
          setModel("");
          setSerial("");
          setInitialHours("0");
          setPhoto(null);
          
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
          return;
        } else {
          let errDetail = "Failed to register machinery on backend database.";
          try {
            const errData = await response.json();
            if (errData?.detail) errDetail = errData.detail;
          } catch (_) {}
          setStatus({ type: "error", text: errDetail });
          setIsSubmitting(false);
          return;
        }
      } catch (err: any) {
        console.error("Network connection error while registering machinery:", err);
        const isAbort = err?.name === "AbortError";
        setStatus({ 
          type: "error", 
          text: isAbort 
            ? "Connection timeout: Slow or unstable network detected on tablet. Your input was preserved. Please click 'Register Machinery' to retry."
            : "Network error: Tablet could not reach the central server. Please check your internet connection and click 'Register Machinery' to retry without losing your data."
        });
        setIsSubmitting(false);
        return; // NEVER fall through to offline mockDb when online!
      }
    }

    // Offline Demo Mode (Strictly for file:// protocol)
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
          maintenance_threshold_hours: maxHours,
          last_maintenance_hours: hours,
          photo: photo || undefined
        });

        setStatus({ type: "success", text: "(Demo Mode) Machinery registered locally. Redirecting..." });
        
        setName("");
        setBrand("");
        setModel("");
        setSerial("");
        setInitialHours("0");
        setPhoto(null);
        
        setTimeout(() => {
          if (typeof window !== "undefined" && window.location.protocol === "file:") {
            window.location.href = "../index.html";
          } else {
            router.push("/dashboard");
          }
        }, 1500);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to save machine.";
        setStatus({ type: "error", text: errorMsg });
      } finally {
        setIsSubmitting(false);
      }
    }, 500);
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
                  {companyName || "Your Company"} (Locked Tenant)
                </div>
              )}
            </div>

          </div>

          {/* Machinery Photo Upload & Camera Capture */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Asset Photo / Camera Capture</label>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              
              {/* Photo Upload Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 w-full h-32 border border-dashed border-zinc-800 bg-zinc-950/20 hover:bg-zinc-900/10 hover:border-zinc-700 transition-all rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer p-4 relative group overflow-hidden"
              >
                {photo ? (
                  <>
                    <img src={photo} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold text-zinc-200">
                      Change Photo
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg text-zinc-400">
                      <PlusCircle className="h-5 w-5" />
                    </div>
                    <div className="text-[11px] text-zinc-400 font-medium text-center">
                      Drag & drop or <span className="text-zinc-200 underline font-semibold">Browse file</span>
                    </div>
                    <div className="text-[9px] text-zinc-600">Supports JPG, PNG up to 2MB</div>
                  </>
                )}
              </div>

              {/* Camera Trigger Option */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 hover:bg-zinc-900/30 transition-all shadow-md active:scale-95 cursor-pointer"
                  title="Take Photo with Camera"
                >
                  <Camera className="h-6 w-6" />
                </button>
                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Use Camera</span>
              </div>

            </div>

            {/* Hidden Native File Input */}
            <input 
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const compressed = await compressImage(file, 1024, 1024, 0.75);
                    setPhoto(compressed);
                  } catch (err) {
                    console.error("Image compression error, falling back:", err);
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setPhoto(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }
              }}
            />

            {photo && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                >
                  Remove Photo
                </button>
              </div>
            )}

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

      {/* Live Camera Modal */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-900 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Live Camera Capture</h3>
              <button 
                type="button" 
                onClick={stopCamera} 
                className="text-zinc-550 hover:text-zinc-300 text-xs"
              >
                Close
              </button>
            </div>
            
            {/* Video Feed */}
            <div className="bg-black aspect-video relative flex items-center justify-center overflow-hidden">
              <video 
                ref={videoRef} 
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
                onClick={stopCamera}
                className="flex-1 h-10 rounded-lg border border-zinc-900 bg-zinc-950 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={capturePhoto}
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
