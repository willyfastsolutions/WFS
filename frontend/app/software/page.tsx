"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wrench, 
  ShieldCheck, 
  Hourglass, 
  BellRing, 
  Mail, 
  ChevronRight, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  BarChart3, 
  ArrowRight,
  TrendingUp,
  Loader2,
  FileText,
  UserCheck,
  AlertTriangle,
  Download,
  Phone,
  MapPin,
  Star,
  MessageCircle,
  Truck,
  ShoppingCart,
  ExternalLink,
  Sparkles,
  ArrowLeft
} from "lucide-react";

type MachineType = "forklift" | "excavator" | "skid_steer";

interface MachineDetail {
  title: string;
  subtitle: string;
  image: string;
  description: string;
  criticalCheck: string;
  routineServices: string[];
  safetyChecks: string[];
  operationalHours: string;
}

export default function SoftwarePage() {
  const [lang, setLang] = useState<"en" | "es">("en");
  const [simHours, setSimHours] = useState<number>(254.5);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<MachineType>("forklift");
  const [fleetSize, setFleetSize] = useState<number>(12);
  const [downtimeCost, setDowntimeCost] = useState<number>(180);
  const [selectedPlan, setSelectedPlan] = useState<string>("Medium Fleet");

  // Form states
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const machineryDetails: Record<MachineType, MachineDetail> = {
    forklift: {
      title: "Forklifts & Pallet Jacks",
      subtitle: "Toyota / Crown / Hyster / Cat / Pallet Trucks",
      image: "../images/forklift.webp",
      description: "High-frequency warehouse assets including electric walkies, manual pallet jacks, and counterbalanced forklifts. WillyFastSolutions monitors hydraulic lift pressure, cylinder seals, wheel wear, and OSHA safety compliance.",
      criticalCheck: "Hydraulic pressure valves, pallet lift cylinders & mast stability",
      routineServices: ["Mast oil & hydraulic cylinder lubrication", "Pallet jack hydraulic seals & wheel roller check", "Engine oil change & air filter clean", "Brake & battery terminal service"],
      safetyChecks: ["Fork wear & thickness caliper measurement", "Working alarms, horn & emergency stop button", "Lights (strobe & headlights)", "Battery acid level & charger connections"],
      operationalHours: "150.0 hrs"
    },
    excavator: {
      title: "Excavators & Backhoes (Retroexcavadoras)",
      subtitle: "Caterpillar / Case / JCB / John Deere / Komatsu",
      image: "../images/excavator.webp",
      description: "High-stress earthmoving machinery and backhoe loaders (retroexcavadoras). WillyFastSolutions repairs hydraulic cylinders, boom hoses, track tension, bucket links, and swing gear assemblies on-site across NYC.",
      criticalCheck: "Hydraulic pump pressure, boom hoses & swing gear grease",
      routineServices: ["Boom & bucket cylinder seal maintenance", "High-pressure hydraulic filters & fluid change", "Air pre-cleaner cartridge blow-out", "Fuel water separator filter service"],
      safetyChecks: ["Track tension alignment & stabilizer link check", "Cabin rollover protection system (ROPS)", "Audible reverse travel warning alarms", "Engine start ignition voltage & alternator check"],
      operationalHours: "480.0 hrs"
    },
    skid_steer: {
      title: "Skid Steer Loaders",
      subtitle: "Bobcat / Case / Kubota",
      image: "../images/skid_steer.webp",
      description: "Compact, agile machines with dynamic attachment changes. WillyFastSolutions handles quick-attach latch inspections, auxiliary hydraulic flow logs, and wheel hub wear logs.",
      criticalCheck: "Quick-attach mechanical latch & auxiliary line integrity",
      routineServices: ["Drive chain tension adjustment", "Engine oil & separator filter", "Engine cooling pack blow-out", "Fuel filter replacement"],
      safetyChecks: ["Seat bar safety interlock switch", "All-around operating worklights", "Backup reverse horn alarm", "Alternator belt tension check"],
      operationalHours: "260.0 hrs"
    }
  };

  const currentMachine = machineryDetails[activeTab];

  const handleSelectPackage = (pkg: string) => {
    setSelectedPlan(pkg);
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      company: formData.get("company"),
      message: `[Software/Telemetry Inquiry - Plan: ${selectedPlan}] ` + formData.get("message")
    };

    try {
      const isFileProtocol = typeof window !== "undefined" && window.location.protocol === "file:";
      const API_BASE_URL = isFileProtocol 
        ? "https://willyfastsolutions.com" 
        : (process.env.NEXT_PUBLIC_API_URL || "");

      const res = await fetch(`${API_BASE_URL}/api/quotes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFormSubmitted(true);
      } else {
        // Fallback to mailto
        window.location.href = `mailto:info@willyfastsolutions.com?subject=Software Quote: ${payload.name}&body=${encodeURIComponent(String(payload.message))}`;
        setFormSubmitted(true);
      }
    } catch {
      window.location.href = `mailto:info@willyfastsolutions.com?subject=Software Quote: ${payload.name}&body=${encodeURIComponent(String(payload.message))}`;
      setFormSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-zinc-800 selection:text-zinc-200 overflow-x-hidden">
      
      {/* Top Bar */}
      <div className="bg-zinc-900/95 border-b border-zinc-800/80 px-4 py-2 text-xs text-zinc-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <a 
              href="../" 
              className="inline-flex items-center gap-1.5 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{lang === "es" ? "← Volver a Taller y Servicios Móviles" : "← Back to Field & Mobile Services"}</span>
            </a>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <span className="text-zinc-400">Enterprise Fleet Telemetry Division</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="inline-flex rounded-lg border border-zinc-800 bg-zinc-950 p-0.5 text-[11px]">
              <button 
                onClick={() => setLang("es")} 
                className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                  lang === "es" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                ES
              </button>
              <button 
                onClick={() => setLang("en")} 
                className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                  lang === "en" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                EN
              </button>
            </div>

            <a 
              href={lang === "es"
                ? "https://wa.me/17184042038?text=Hola%20Willy%20Fast%20Solutions,%20deseo%20informaci%C3%B3n%20sobre%20el%20Software%20de%20Telemetr%C3%ADa%20y%20Mantenimiento%20de%20Flotas"
                : "https://wa.me/17184042038?text=Hello%20Willy%20Fast%20Solutions,%20I%20would%20like%20information%20about%20your%20Fleet%20Telemetry%20and%20Maintenance%20Software"
              }
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold hover:bg-emerald-600/30 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp B2B
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/85 border-b border-zinc-900 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="../" className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg shadow-sm flex items-center justify-center w-10 h-10 overflow-hidden">
              <img src="../logo/logo.png" alt="WillyFastSolutions Logo" className="w-full h-full object-cover filter brightness-110" />
            </a>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent block leading-none">
                WFS Telemetry SaaS
              </span>
              <span className="text-[10px] text-zinc-500 font-medium block">Fleet Maintenance Platform</span>
            </div>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a href="#simulator" className="hover:text-zinc-100 transition-colors">{lang === "es" ? "Simulador en Vivo" : "Live Simulator"}</a>
            <a href="#machinery" className="hover:text-zinc-100 transition-colors">{lang === "es" ? "Checklists OSHA" : "OSHA Checklists"}</a>
            <a href="#calculator" className="hover:text-zinc-100 transition-colors">{lang === "es" ? "Calculadora ROI" : "ROI Calculator"}</a>
            <a href="#daemon" className="hover:text-zinc-100 transition-colors">{lang === "es" ? "Agente Auditor 24/7" : "Audit Daemon"}</a>
            <a href="#pricing" className="hover:text-zinc-100 transition-colors">{lang === "es" ? "Planes de Flota" : "Fleet Packages"}</a>
          </nav>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <a 
              href="../" 
              className="hidden sm:inline-flex h-9 items-center justify-center rounded-lg border border-zinc-800 px-3 text-xs font-semibold text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
            >
              <Wrench className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
              {lang === "es" ? "Taller & Mecánicos" : "Field Mechanics"}
            </a>
            <a 
              href="../login/"
              onClick={(e) => {
                if (typeof window !== "undefined" && window.location.protocol === "file:") {
                  e.preventDefault();
                  window.location.href = "../login/index.html";
                }
              }}
              id="btn-login" 
              className="inline-flex h-9 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 text-xs font-bold text-emerald-400 transition-all hover:bg-emerald-500/20 shadow-sm cursor-pointer"
            >
              {lang === "es" ? "Portal Clientes (Login)" : "Client Portal (Login)"}
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden border-b border-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 flex flex-col gap-6">
            <div className="inline-flex self-center md:self-start items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>⚙️ 24/7 Automated Fleet Telemetry & Preventive Maintenance Daemon</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight bg-gradient-to-b from-zinc-50 to-zinc-300 bg-clip-text text-transparent">
              {lang === "es" ? (
                <>
                  Telemetría Inteligente y Mantenimiento de Flotas sin Fricción
                </>
              ) : (
                <>
                  Autonomous Fleet Telemetry & Preventive Maintenance Platform
                </>
              )}
            </h1>
            
            <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
              {lang === "es" ? (
                <>
                  Olvida las planillas de cálculo y el mantenimiento tardío. WillyFastSolutions monitorea horómetros en tiempo real, ejecuta auditorías automáticas de seguridad OSHA y despacha reportes ejecutivos en PDF a los supervisores de tu empresa.
                </>
              ) : (
                <>
                  Stop relying on outdated spreadsheets and delayed maintenance. WillyFastSolutions logs operating hours continuously, triggers automated OSHA compliance audits, and dispatches executive PDF reports directly to fleet supervisors.
                </>
              )}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 justify-center md:justify-start flex-wrap">
              <a 
                href="../login/"
                onClick={(e) => {
                  if (typeof window !== "undefined" && window.location.protocol === "file:") {
                    e.preventDefault();
                    window.location.href = "../login/index.html";
                  }
                }}
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 text-sm font-bold text-black transition-all hover:bg-emerald-400 hover:scale-102 active:scale-95 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
              >
                <Cpu className="h-4 w-4" /> {lang === "es" ? "Iniciar Sesión en el Software" : "Access Client Portal"}
              </a>
              <a 
                href="#calculator" 
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-6 text-sm font-semibold text-zinc-300 transition-all hover:bg-zinc-900 hover:text-zinc-100"
              >
                <BarChart3 className="h-4 w-4 text-emerald-400" /> {lang === "es" ? "Calculadora de Ahorro" : "Calculate Fleet ROI"}
              </a>
              <button 
                onClick={() => setShowReportModal(true)} 
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-5 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer"
              >
                <FileText className="h-4 w-4 text-amber-400" /> {lang === "es" ? "Ver Reporte PDF Muestra" : "Sample PDF Report"}
              </button>
            </div>
          </div>

          {/* Telemetry Dashboard Preview */}
          <div className="flex-1 w-full max-w-lg md:max-w-none">
            <div className="relative border border-zinc-800 bg-zinc-900/30 rounded-xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm group hover:border-zinc-700/80 transition-all duration-500">
              <div className="absolute top-3 left-4 flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-zinc-800" />
                <span className="w-3 h-3 rounded-full bg-zinc-800" />
                <span className="w-3 h-3 rounded-full bg-zinc-800" />
              </div>
              <div className="text-xs text-zinc-500 text-right mb-6 font-mono">telemetry_dashboard.json</div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/85 bg-zinc-950/70 transition-all hover:-translate-y-0.5 duration-300 hover:border-zinc-700">
                  <div className="flex items-center gap-3">
                    <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                      <Cpu className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-200">Titan Excavator XL</div>
                      <div className="text-[10px] text-zinc-500">Excavator • SN-CAT-554321</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-rose-400">480.0 hrs</div>
                    <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400">
                      Overdue (Threshold: 250h)
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/85 bg-zinc-950/70 transition-all hover:-translate-y-0.5 duration-300 hover:border-zinc-700">
                  <div className="flex items-center gap-3">
                    <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                      <Activity className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-200">Apex Forklift 1</div>
                      <div className="text-[10px] text-zinc-500">Forklift • SN-TOY-987211</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-zinc-300">260.0 hrs</div>
                    <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      Healthy (Last Serv: 250h)
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-400" /> OSHA Safety Checklist Status</span>
                  <span className="text-[10px] uppercase tracking-wide font-semibold text-emerald-400">100% Passed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simulator Section */}
      <section id="simulator" className="py-20 md:py-28 border-b border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Interactive Alert Simulator */}
            <div className="w-full relative overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-900/40 p-6 shadow-2xl backdrop-blur-sm">
              <div className="flex justify-between items-start border-b border-zinc-900 pb-4 mb-6">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Live Telemetry Console Simulator</div>
                  <h3 className="text-lg font-bold text-zinc-200 mt-0.5">Toyota 8FGU25 Forklift</h3>
                  <div className="text-[10px] font-mono text-zinc-600 mt-0.5">SN-CAT-554321 • Depot A</div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-zinc-800 bg-zinc-900 text-[9px] font-mono text-zinc-400">
                  <Activity className="h-3 w-3 text-emerald-500 animate-pulse" /> Daemon Active
                </div>
              </div>

              {/* Dynamic Status Display */}
              <div className="flex flex-col items-center justify-center py-6 bg-zinc-950/60 rounded-xl border border-zinc-900 mb-6 relative overflow-hidden">
                <div className={`absolute inset-0 opacity-5 blur-2xl transition-colors duration-500 ${
                  simHours < 200 ? 'bg-emerald-500' : simHours < 250 ? 'bg-amber-500' : 'bg-rose-500'
                }`} />

                <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1">Simulated Operating Hours</div>
                <div className="text-4xl font-extrabold tracking-tight text-zinc-100 font-mono mb-2">
                  {simHours.toFixed(1)} <span className="text-zinc-500 text-lg font-normal font-sans">hrs</span>
                </div>

                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-300 ${
                  simHours < 200 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : simHours < 250 
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    simHours < 200 ? 'bg-emerald-500' : simHours < 250 ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                  {simHours < 200 ? 'HEALTHY' : simHours < 250 ? 'WARNING (Upcoming PM)' : 'OVERDUE (Audit Warning)'}
                </div>
              </div>

              {/* Slider Control */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Drag to simulate machine hours:</span>
                  <span className="text-zinc-200 font-semibold font-mono">{simHours.toFixed(1)}h</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="350" 
                  value={simHours} 
                  onChange={(e) => setSimHours(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
                />
                <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
                  <span>0h (New)</span>
                  <span>200h (Warning)</span>
                  <span>250h (Service Limit)</span>
                  <span>350h (Critical)</span>
                </div>
              </div>

              {/* Sliding Email Notification */}
              <AnimatePresence>
                {simHours >= 250 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border border-rose-500/20 bg-rose-950/10 rounded-xl p-4 shadow-xl space-y-3">
                      <div className="flex justify-between items-start border-b border-zinc-900/80 pb-2">
                        <div>
                          <div className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500"></span> Daemon Audit Alert Dispatched
                          </div>
                          <h4 className="text-xs font-bold text-zinc-300 mt-1">To: fleetmanager@company.com</h4>
                        </div>
                        <span className="text-[9px] text-zinc-500 font-mono">Just Now</span>
                      </div>
                      <div className="text-xs text-zinc-400 leading-relaxed font-sans">
                        <strong>Subject:</strong> ⚠️ WillyFastSolutions Urgent Audit - Forklift SN-554321 Overdue<br />
                        Asset has crossed the <strong>250h</strong> maintenance limit (current: <strong>{simHours.toFixed(1)}h</strong>). Safety PDF report is attached below.
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setShowReportModal(true)}
                          className="inline-flex h-8 items-center justify-center gap-1.5 px-3 rounded bg-zinc-100 text-[10px] font-bold text-zinc-950 hover:bg-zinc-200 transition-colors w-full cursor-pointer"
                        >
                          <FileText className="h-3 w-3" /> Preview Audit Report (PDF)
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Explanatory text */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-900 bg-zinc-900/30 text-xs text-zinc-500">
                <Clock className="h-3.5 w-3.5 text-emerald-400" /> Continuous Cloud Monitoring
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-100">
                {lang === "es" ? "Agente Auditor en Segundo Plano (Daemon)" : "Automated Auditing Agent (Daemon)"}
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                {lang === "es" 
                  ? "WillyFastSolutions integra un proceso de fondo que escanea la base de datos de manera constante. Cuando un montacargas o excavadora cruza su umbral programado (ej. 250 horas), genera y despacha un informe ejecutivo directamente a tu correo."
                  : "WillyFastSolutions integrates a background worker process that queries operating hours continuously and identifies equipment exceeding service thresholds without manual data entry."}
              </p>

              <div className="space-y-4 text-xs sm:text-sm text-zinc-400">
                <div className="flex gap-3 items-start">
                  <div className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 mt-0.5">
                    <Cpu className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-300">Continuous Database Scanning</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Identifies equipment exceeding operating thresholds and prevents unmonitored machine failures.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 mt-0.5">
                    <FileText className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-300">Instant Executive PDF Generation</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Generates clean executive PDF audit reports including essential KPIs, safety statuses, and checklists ready for insurance audits.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 mt-0.5">
                    <Mail className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-300">Automated Dispatch</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Sends reports automatically to company emails, ensuring you remain OSHA compliant without clicking a single button.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Machinery Interactive Checklist Section */}
      <section id="machinery" className="py-20 md:py-28 border-b border-zinc-900 bg-zinc-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-100">
              Interactive Fleet Checklist & Class Specifications
            </h2>
            <p className="mt-4 text-sm sm:text-base text-zinc-400">
              Select a machinery type below to review its customized preventive maintenance specifications, generated inspection checklists, and hourly telemetry rules.
            </p>
          </div>

          {/* Tabs Navigation */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1 rounded-lg border border-zinc-800 bg-zinc-950/60">
              {(["forklift", "excavator", "skid_steer"] as MachineType[]).map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer capitalize ${
                    activeTab === tab 
                      ? "bg-zinc-800 text-zinc-100 shadow-sm" 
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab.replace("_", " ")}s
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content Box */}
          <div className="bg-zinc-950 border border-zinc-900 p-4 sm:p-8 rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Image with Glass Frame */}
              <div className="relative group overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-2">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10 opacity-60" />
                <img 
                  src={currentMachine.image} 
                  alt={currentMachine.title}
                  className="w-full h-auto object-cover rounded-lg transform group-hover:scale-103 transition-transform duration-500 filter brightness-90"
                />
                
                <div className="absolute bottom-6 left-6 z-20 space-y-1">
                  <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-semibold tracking-wider bg-zinc-100 text-zinc-950 uppercase">
                    Class Overview
                  </span>
                  <h3 className="text-xl font-bold text-zinc-100">{currentMachine.title}</h3>
                  <p className="text-xs text-zinc-400">{currentMachine.subtitle}</p>
                </div>
              </div>

              {/* Right Column: Specification Details & Checklists */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-zinc-100">Maintenance Outline</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {currentMachine.description}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-rose-500/10 bg-rose-500/5 text-xs text-rose-400/95 font-medium shadow-sm">
                  <strong>Critical Wear Check:</strong> {currentMachine.criticalCheck}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5 text-zinc-400" /> Routine Services
                    </h4>
                    <ul className="space-y-1.5 text-xs text-zinc-400">
                      {currentMachine.routineServices.map((service, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400/80" /> Safety Checklist
                    </h4>
                    <ul className="space-y-1.5 text-xs text-zinc-400">
                      {currentMachine.safetyChecks.map((safety, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500/80" />
                          {safety}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-500">Standard Test Interval:</span>
                    <span className="font-semibold text-zinc-300">Every 250.0 Hours</span>
                  </div>
                  
                  <button 
                    onClick={() => handleSelectPackage(currentMachine.title)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1 text-xs font-semibold text-zinc-200 hover:text-zinc-100 transition-colors cursor-pointer group"
                  >
                    Request quote for this model <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Fleet ROI Calculator */}
      <section id="calculator" className="py-20 md:py-28 bg-zinc-900/20 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-100">
                Data-Driven Fleet Longevity
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                By automating preventive maintenance schedules, you reduce unplanned downtime and protect your capital investments. Ensure your equipment runs reliably for years.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="bg-zinc-900 p-1 rounded border border-zinc-800 mt-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200">Reduce Downtime by up to 35%</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">Catch wear and tear early before it leads to catastrophic mechanical failures.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="bg-zinc-900 p-1 rounded border border-zinc-800 mt-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200">100% Audit Readiness</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">Keep historical database logs of all inspections, hours, and repairs ready for insurance and OSHA audits.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="bg-zinc-900 p-1 rounded border border-zinc-800 mt-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200">Extend Machinery Lifecycle</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">Ensure regular oil changes, plug replacements, and battery checks happen precisely on scheduled intervals.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculator Card */}
            <div className="border border-zinc-900 bg-zinc-900/30 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
              <div>
                <h3 className="text-xl font-bold text-zinc-100 font-sans">Fleet Savings Calculator</h3>
                <p className="text-xs text-zinc-400 mt-1">Estimate your annual downtime recovery and financial reclaim.</p>
              </div>

              {/* Slider 1: Fleet Size */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Fleet Size</span>
                  <span className="text-zinc-200 font-semibold font-mono">{fleetSize} Machines</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={fleetSize} 
                  onChange={(e) => setFleetSize(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
                />
              </div>

              {/* Slider 2: Downtime Cost per Hour */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Hourly Downtime Cost</span>
                  <span className="text-zinc-200 font-semibold font-mono">${downtimeCost}/hr</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="500" 
                  step="10"
                  value={downtimeCost} 
                  onChange={(e) => setDowntimeCost(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
                />
              </div>

              {/* Calculations results */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-900">
                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900/85">
                  <div className="text-[10px] uppercase font-bold text-zinc-500">Downtime Saved</div>
                  <div className="text-2xl font-bold text-zinc-200 font-mono mt-1">
                    {fleetSize * 14} <span className="text-xs text-zinc-500 font-normal">hrs/yr</span>
                  </div>
                  <p className="text-[9px] text-zinc-500 mt-1">Based on a 35% downtime reduction.</p>
                </div>
                
                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900/85 relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/5 blur-xl opacity-30" />
                  <div className="text-[10px] uppercase font-bold text-emerald-500">Annual Recovered</div>
                  <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
                    ${(fleetSize * 14 * downtimeCost).toLocaleString()}
                  </div>
                  <p className="text-[9px] text-zinc-500 mt-1">Annual savings reclaimed.</p>
                </div>
              </div>

              <button 
                onClick={() => handleSelectPackage(`Fleet ROI Plan (${fleetSize} machines)`)}
                className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors shadow-md cursor-pointer"
              >
                Request Custom Quote for {fleetSize} Machines
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing / Packages Section */}
      <section id="pricing" className="py-20 md:py-28 border-b border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-100">
              Fleet Maintenance Service Packages
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              Select your fleet tier below and request a direct service quotation for your warehouse or construction operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* Package 1 */}
            <div className="border border-zinc-900 bg-zinc-900/10 p-8 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-colors duration-300">
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Small Fleet</div>
                  <h3 className="text-lg font-bold text-zinc-200">Up to 5 Machines</h3>
                  <p className="text-xs text-zinc-500 mt-1">Ideal for local sub-contractors</p>
                </div>
                <ul className="space-y-3 text-xs text-zinc-400 pt-4 border-t border-zinc-900">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-zinc-500" /> Bi-weekly hour meter audit</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-zinc-500" /> Manual inspections</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-zinc-500" /> Basic component grease & filters</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-zinc-500" /> Standard PDF Reports</li>
                </ul>
              </div>
              <div className="mt-8">
                <button 
                  onClick={() => handleSelectPackage("Small Fleet (Up to 5 Machines)")}
                  className="w-full inline-flex h-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 transition-all cursor-pointer"
                >
                  Request Quote
                </button>
              </div>
            </div>

            {/* Package 2 - Recommended */}
            <div className="relative border-2 border-zinc-800 bg-zinc-900/30 p-8 rounded-2xl flex flex-col justify-between shadow-xl">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-950 uppercase shadow-md animate-bounce">
                <TrendingUp className="h-3.5 w-3.5" /> Most Requested
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">Medium Fleet</div>
                  <h3 className="text-lg font-bold text-zinc-100">6 to 25 Machines</h3>
                  <p className="text-xs text-zinc-400 mt-1">For active logistics & civil companies</p>
                </div>
                <ul className="space-y-3 text-xs text-zinc-300 pt-4 border-t border-zinc-800">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Weekly automated telemetry updates</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Complete engine, lube, & spark audits</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> 24/7 background audit worker daemon</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Executive PDF reports with KPIs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Direct email alerts for supervisors</li>
                </ul>
              </div>
              
              <div className="mt-8">
                <button 
                  onClick={() => handleSelectPackage("Medium Fleet (6 to 25 Machines)")}
                  className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-md cursor-pointer"
                >
                  Request Quote
                </button>
              </div>
            </div>

            {/* Package 3 */}
            <div className="border border-zinc-900 bg-zinc-900/10 p-8 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-colors duration-300">
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Enterprise Fleet</div>
                  <h3 className="text-lg font-bold text-zinc-200">26+ Machines</h3>
                  <p className="text-xs text-zinc-500 mt-1">For multinational operations</p>
                </div>
                <ul className="space-y-3 text-xs text-zinc-400 pt-4 border-t border-zinc-900">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-zinc-500" /> Custom real-time hardware telemetry integration</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-zinc-500" /> Dedicated daemon auditor instances</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-zinc-500" /> Custom compliance reporting (OSHA / ISO)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-zinc-500" /> Dedicated response technician</li>
                </ul>
              </div>
              <div className="mt-8">
                <button 
                  onClick={() => handleSelectPackage("Enterprise Fleet (26+ Machines)")}
                  className="w-full inline-flex h-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 transition-all cursor-pointer"
                >
                  Contact Sales
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 md:py-28 bg-zinc-950 border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-zinc-900 bg-zinc-900/20 rounded-2xl p-6 sm:p-10 backdrop-blur-sm space-y-8">
            <div className="text-center max-w-lg mx-auto space-y-3">
              <div className="inline-flex bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 text-zinc-400">
                <Mail className="h-5 w-5 text-emerald-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
                Request an Enterprise Fleet Telemetry Quotation
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Interested in deploying automated telemetry and maintenance tracking for your equipment? Complete the form below.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-center text-emerald-400 text-sm">
                Thank you! Your quote request has been received. Our team will review your fleet details and contact you shortly.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-400">Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      placeholder="John Doe"
                      required
                      className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-400">Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="john@company.com"
                      required
                      className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Company Name</label>
                  <input 
                    type="text" 
                    name="company" 
                    placeholder="Apex Logistics Ltd"
                    required
                    className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Fleet Scope / Inquiries</label>
                  <textarea 
                    name="message" 
                    rows={4}
                    defaultValue={`I am interested in ${selectedPlan}. We have approx ${fleetSize} machines needing hour meter tracking and OSHA reports.`}
                    required
                    className="w-full p-3 rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full inline-flex h-11 items-center justify-center rounded-lg bg-zinc-100 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 transition-all shadow-md cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Submit Quotation Request"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-500 py-12 border-t border-zinc-900 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex justify-center items-center gap-2">
            <div className="w-6 h-6 rounded-md overflow-hidden flex items-center justify-center bg-zinc-900 border border-zinc-800">
              <img src="../logo/logo.png" alt="WFS Logo" className="w-full h-full object-cover filter brightness-110" />
            </div>
            <span className="font-semibold text-sm text-zinc-400">WillyFastSolutions Telemetry</span>
          </div>
          <p className="text-xs text-zinc-500">
            Enterprise Fleet Telemetry & Preventive Maintenance Daemon • Queens, NY
          </p>
          <div className="text-[10px] text-zinc-600 pt-4 border-t border-zinc-900/60 max-w-xs mx-auto">
            &copy; {new Date().getFullYear()} WillyFastSolutions. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Report Modal Popup */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-zinc-950/40">
                <div className="flex items-center gap-2">
                  <div className="bg-zinc-900 border border-zinc-800 p-1 rounded w-6 h-6 overflow-hidden flex items-center justify-center">
                    <img src="../logo/logo.png" alt="WFS Logo" className="w-full h-full object-cover filter brightness-110" />
                  </div>
                  <span className="font-bold text-xs tracking-wider text-zinc-400">WillyFastSolutions Report Engine</span>
                </div>
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="text-zinc-500 hover:text-zinc-300 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 bg-zinc-950/20 text-zinc-300 font-sans">
                <div className="flex justify-between items-start border-b border-zinc-800/80 pb-4">
                  <div>
                    <h1 className="text-xl font-extrabold text-zinc-100 tracking-tight">
                      WillyFastSolutions
                    </h1>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Heavy Machinery Maintenance Services</p>
                    <p className="text-[9px] text-zinc-600">US Fleet Operations Division</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex px-2 py-0.5 rounded text-[8px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 uppercase tracking-wider">
                      Urgent PM Required
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-2 font-mono">Report ID: WFS-2026-00329</p>
                    <p className="text-[9px] text-zinc-600 font-mono">Date Generated: 06/10/2026</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="text-[9px] uppercase font-bold text-zinc-500">Prepared For</div>
                    <div className="font-bold text-zinc-200">Apex Logistics Ltd.</div>
                    <div className="text-zinc-500">Contact: manager@apexlogistics.com</div>
                    <div className="text-zinc-500">Location: Depot A, Houston TX</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] uppercase font-bold text-zinc-500">Asset Specifications</div>
                    <div className="font-bold text-zinc-200">Toyota 8FGU25 Forklift</div>
                    <div className="text-zinc-500 font-mono">Serial: SN-CAT-554321</div>
                    <div className="text-zinc-500 font-mono">Limit: 250.0h • Current: {simHours.toFixed(1)}h</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/5 space-y-2">
                  <h3 className="text-xs font-bold text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Maintenance Threshold Breach Detected
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Our background telemetry daemon identified that this asset has operated for <strong>{(simHours - 250).toFixed(1)} hours past its limit</strong> without the required 250-hour service checklist being logged.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-[9px] uppercase font-bold text-zinc-500 mb-1">Preventive Audit Checklist (Auto-Generated)</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded bg-zinc-900/40 border border-zinc-800/60">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        <span>Mast Oil & Cylinder Lubrication</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">Ready (Verified)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-zinc-900/40 border border-zinc-800/60">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                        <span className="font-medium text-zinc-200">Engine Oil & Filter replacement</span>
                      </div>
                      <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">Overdue (Wear Risk)</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-zinc-900 text-[9px] text-zinc-600">
                  <div>WillyFastSolutions Telemetry Audit daemon v2.0.1 (Secure Sign-off)</div>
                  <div>Authorized Copy • Non-transferable</div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/40 flex justify-end gap-3">
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="inline-flex h-9 items-center justify-center px-4 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
                <button 
                  onClick={() => window.print()}
                  className="inline-flex h-9 items-center justify-center gap-1.5 px-4 rounded-lg bg-zinc-100 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Print Report
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
