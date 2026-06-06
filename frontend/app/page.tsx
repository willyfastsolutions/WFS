"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  FileText
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

export default function Home() {
  const [activeTab, setActiveTab] = useState<MachineType>("forklift");
  const [quoteMessage, setQuoteMessage] = useState("");

  const handleSelectPackage = (packageName: string) => {
    // Smooth scroll to contact section
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
    
    // Auto-fill the message textarea with the package name
    const textarea = document.getElementById("contact-message") as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = `Hello, I would like to request a quotation for the WillyFastSolutions "${packageName}" maintenance service package for my fleet.`;
      textarea.focus();
    }
  };

  const machineryDetails: Record<MachineType, MachineDetail> = {
    forklift: {
      title: "Industrial Forklifts",
      subtitle: "Toyota / Hyster / Caterpillar",
      image: "/images/forklift.png",
      description: "High-frequency warehouse assets requiring strict load-safety compliance. WillyFastSolutions monitors mast hydraulics, lifting speed degradation, and tire wear intervals.",
      criticalCheck: "Hydraulic pressure valves & mast tilt stability",
      routineServices: ["Mast oil & cylinder lubrication", "Engine oil change & oil filter", "Air intake filter clean", "Brake fluid check"],
      safetyChecks: ["Fork wear & thickness caliper measurement", "Working alarms & horn", "Lights (strobe & headlights)", "Battery acid level & terminal clean"],
      operationalHours: "150.0 hrs"
    },
    excavator: {
      title: "Heavy Excavators",
      subtitle: "Caterpillar / Komatsu / John Deere",
      image: "/images/excavator.png",
      description: "High-stress earthmoving machinery operating in abrasive dust conditions. WillyFastSolutions alerts for track tension wear, swing gear lubrication, and cooling radiator status.",
      criticalCheck: "Hydraulic pump flow & boom swing gear grease",
      routineServices: ["Swing drive fluid change", "Engine oil & hydraulic filters", "Air pre-cleaner cartridge", "Glow plug replacement"],
      safetyChecks: ["Track tension alignment & links check", "Cabin rollover protection system (ROPS)", "Audible travel warning alarms", "Engine start ignition voltage"],
      operationalHours: "480.0 hrs"
    },
    skid_steer: {
      title: "Skid Steer Loaders",
      subtitle: "Bobcat / Case / Kubota",
      image: "/images/skid_steer.png",
      description: "Compact, agile machines with dynamic attachment changes. WillyFastSolutions handles quick-attach latch inspections, auxiliary hydraulic flow logs, and wheel hub wear logs.",
      criticalCheck: "Quick-attach mechanical latch & auxiliary line integrity",
      routineServices: ["Drive chain tension adjustment", "Engine oil & separator filter", "Engine cooling pack blow-out", "Fuel filter replacement"],
      safetyChecks: ["Seat bar safety interlock switch", "All-around operating worklights", "Backup reverse horn alarm", "Alternator belt tension check"],
      operationalHours: "260.0 hrs"
    }
  };

  const currentMachine = machineryDetails[activeTab];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-zinc-800 selection:text-zinc-200">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-900 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg shadow-sm flex items-center justify-center w-10 h-10 overflow-hidden">
              <img src="/logo/logo.png" alt="WillyFastSolutions Logo" className="w-full h-full object-cover filter brightness-110" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              WillyFastSolutions
            </span>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#home" id="nav-home" className="hover:text-zinc-100 transition-colors">Home</a>
            <a href="#machinery" id="nav-machinery" className="hover:text-zinc-100 transition-colors">Fleet Models</a>
            <a href="#features" id="nav-features" className="hover:text-zinc-100 transition-colors">Features</a>
            <a href="#benefits" id="nav-benefits" className="hover:text-zinc-100 transition-colors">Fleet Benefits</a>
            <a href="#pricing" id="nav-pricing" className="hover:text-zinc-100 transition-colors">Services</a>
            <a href="#contact" id="nav-contact" className="hover:text-zinc-100 transition-colors">Contact</a>
          </nav>
          
          {/* Action Button */}
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              id="btn-login" 
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-4 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-900 hover:text-zinc-100 hover:border-zinc-700 shadow-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative py-20 md:py-28 overflow-hidden border-b border-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 flex flex-col gap-6">
            <div className="inline-flex self-center md:self-start items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Heavy Machinery Maintenance Provider
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight bg-gradient-to-b from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
              Automated Maintenance Audits for Heavy Machinery
            </h1>
            
            <p className="text-base sm:text-lg text-zinc-400 max-w-xl">
              Monitor operating hours and perform routine checklists for your fleet of heavy machinery. Get automated audit reports sent to your email before thresholds are crossed.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 justify-center md:justify-start">
              <a 
                href="#pricing" 
                id="btn-hero-start" 
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-lg bg-zinc-100 px-6 text-sm font-medium text-zinc-950 transition-all hover:bg-zinc-200 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              >
                Request Service
              </a>
              <a 
                href="#machinery" 
                id="btn-hero-learn" 
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-6 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-900 hover:text-zinc-100 hover:border-zinc-700"
              >
                Inspect Machinery
              </a>
            </div>
          </div>

          {/* Interactive Live Status Widget */}
          <div className="flex-1 w-full max-w-lg md:max-w-none">
            <div className="relative border border-zinc-800 bg-zinc-900/30 rounded-xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
              <div className="absolute top-3 left-4 flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-zinc-800" />
                <span className="w-3 h-3 rounded-full bg-zinc-800" />
                <span className="w-3 h-3 rounded-full bg-zinc-800" />
              </div>
              <div className="text-xs text-zinc-500 text-right mb-6">telemetry_dashboard.json</div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/80 bg-zinc-950/60 transition-all hover:border-zinc-700">
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
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/80 bg-zinc-950/60 transition-all hover:border-zinc-700">
                  <div className="flex items-center gap-3">
                    <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                      <Activity className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-200">Apex Loader 1</div>
                      <div className="text-[10px] text-zinc-500">Skid Steer • SN-BOB-987211</div>
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
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Security Checklist Status</span>
                  <span className="text-[10px] uppercase tracking-wide font-semibold text-emerald-400">100% Passed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Machinery Interactive Section */}
      <section id="machinery" className="py-20 md:py-28 border-b border-zinc-900 bg-zinc-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-100">
              Interactive Fleet Checklist & Details
            </h2>
            <p className="mt-4 text-sm sm:text-base text-zinc-400">
              Select a machinery type below to review its customized preventive maintenance specifications, generated inspection checklists, and hourly telemetry rules.
            </p>
          </div>

          {/* Tabs Navigation */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1 rounded-lg border border-zinc-800 bg-zinc-950/60">
              <button 
                onClick={() => setActiveTab("forklift")}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeTab === "forklift" 
                    ? "bg-zinc-800 text-zinc-100 shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Forklifts
              </button>
              <button 
                onClick={() => setActiveTab("excavator")}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeTab === "excavator" 
                    ? "bg-zinc-800 text-zinc-100 shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Excavators
              </button>
              <button 
                onClick={() => setActiveTab("skid_steer")}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeTab === "skid_steer" 
                    ? "bg-zinc-800 text-zinc-100 shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Skid Steers
              </button>
            </div>
          </div>

          {/* Tab Content Box */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-zinc-950 border border-zinc-900 p-6 sm:p-10 rounded-2xl shadow-xl">
            
            {/* Left Column: Image with Glass Frame */}
            <div className="relative group overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-2">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10 opacity-60" />
              <img 
                src={currentMachine.image} 
                alt={currentMachine.title}
                className="w-full h-auto object-cover rounded-lg transform group-hover:scale-102 transition-transform duration-500 filter brightness-90"
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

              {/* Critical Check Indicator */}
              <div className="p-3.5 rounded-lg border border-rose-500/10 bg-rose-500/5 text-xs text-rose-400/90">
                <strong>Critical Wear Check:</strong> {currentMachine.criticalCheck}
              </div>

              {/* Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Routine Services */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Wrench className="h-3.5 w-3.5 text-zinc-400" /> Routine Services
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-400">
                    {currentMachine.routineServices.map((service, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-zinc-600" />
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mandatory Safety checks */}
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

              {/* Actions & telemetry preview */}
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
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 border-b border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-100">
              Built for Heavy Duty Operations
            </h2>
            <p className="mt-4 text-sm sm:text-base text-zinc-400">
              Stop relying on spreadsheets and manual checks. WillyFastSolutions provides automated, bulletproof tracking for heavy machinery operators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-zinc-900 bg-zinc-950 p-6 rounded-xl space-y-4 hover:border-zinc-800 transition-all hover:bg-zinc-900/30">
              <div className="inline-flex bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                <Hourglass className="h-6 w-6 text-zinc-300" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-200">Precise Hour Meter Logging</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Log accurate operating hours (horómetro) for each machine. Automatically update fleet diagnostic metrics to trigger maintenance intervals correctly.
              </p>
            </div>

            <div className="border border-zinc-900 bg-zinc-950 p-6 rounded-xl space-y-4 hover:border-zinc-800 transition-all hover:bg-zinc-900/30">
              <div className="inline-flex bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                <ShieldCheck className="h-6 w-6 text-zinc-300" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-200">Preventive Maintenance Checklist</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Step-by-step validation of critical components: oil change, oil/air filters, spark plugs, battery checks, working lights, horn, and ignition systems.
              </p>
            </div>

            <div className="border border-zinc-900 bg-zinc-950 p-6 rounded-xl space-y-4 hover:border-zinc-800 transition-all hover:bg-zinc-900/30">
              <div className="inline-flex bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                <BellRing className="h-6 w-6 text-zinc-300" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-200">Automated Audit Alerts</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Our background daemon worker continuously scans the database, automatically generating executive reports and emailing them directly to company admins when thresholds are breached.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Benefits Section */}
      <section id="benefits" className="py-20 md:py-28 bg-zinc-905 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-100">
                Data-Driven Fleet Longevity
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                By automating preventive maintenance schedules, you reduce maintenance costs and protect your capital investments. Ensure your equipment runs reliably for years.
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

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-xl border border-zinc-900 bg-zinc-950 text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-zinc-200">-35%</div>
                <div className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider font-semibold">Unscheduled Downtime</div>
              </div>
              <div className="p-6 rounded-xl border border-zinc-900 bg-zinc-950 text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-zinc-200">100%</div>
                <div className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider font-semibold">OSHA Compliance</div>
              </div>
              <div className="p-6 rounded-xl border border-zinc-900 bg-zinc-950 text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-zinc-200">24/7</div>
                <div className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider font-semibold">Daemon Monitoring</div>
              </div>
              <div className="p-6 rounded-xl border border-zinc-900 bg-zinc-950 text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-zinc-200">&lt;5m</div>
                <div className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider font-semibold">Audit PDF Dispatch</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Service Tiers / Request Quotation Section */}
      <section id="pricing" className="py-20 md:py-28 border-b border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-100">
              Fleet Maintenance Service Packages
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              WillyFastSolutions is your independent preventive maintenance provider. Select your fleet tier below and request a direct service quotation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* Package 1 */}
            <div className="border border-zinc-900 bg-zinc-900/10 p-8 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-all">
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
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-950 uppercase shadow-md">
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
            <div className="border border-zinc-900 bg-zinc-900/10 p-8 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-all">
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

      {/* Modules Section */}
      <section id="modules" className="py-20 md:py-28 border-b border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-100">
              Modular Platform Design
            </h2>
            <p className="mt-4 text-sm sm:text-base text-zinc-400">
              A comprehensive architecture built to run seamlessly across web apps, databases, and background tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-zinc-900 bg-zinc-900/10 p-6 rounded-xl flex flex-col justify-between hover:border-zinc-800 transition-all">
              <div className="space-y-4">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Module A</div>
                <h3 className="text-lg font-bold text-zinc-200">Public Front-End</h3>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Fully responsive, English-first public landing page with modern SEO meta elements and secure Supabase login routing.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center gap-1 text-xs text-zinc-400">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" /> Active & Optimized
              </div>
            </div>

            <div className="border border-zinc-900 bg-zinc-900/10 p-6 rounded-xl flex flex-col justify-between hover:border-zinc-800 transition-all">
              <div className="space-y-4">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Module B</div>
                <h3 className="text-lg font-bold text-zinc-200">Multi-tenant SaaS Portal</h3>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Secure dashboards for Superadmins and Company Admins. Track hour meters, perform safety validations, and manage forklifts, excavators, and loaders.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center gap-1 text-xs text-zinc-400">
                <Clock className="h-4.5 w-4.5 text-amber-500/80" /> Development Ready
              </div>
            </div>

            <div className="border border-zinc-900 bg-zinc-900/10 p-6 rounded-xl flex flex-col justify-between hover:border-zinc-800 transition-all">
              <div className="space-y-4">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Module C</div>
                <h3 className="text-lg font-bold text-zinc-200">Automated Audit Daemon</h3>
                <p className="text-xs sm:text-sm text-zinc-400">
                  A Python worker running 24/7. Scans database hour threshold crossings, generates PDF reports, and notifies company executives automatically via SMTP.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center gap-1 text-xs text-zinc-400">
                <BarChart3 className="h-4.5 w-4.5 text-amber-500/80" /> Blueprint Completed
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
                <Mail className="h-5 w-5" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
                Request a Service Quotation
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Interested in fleet maintenance services by WillyFastSolutions? Complete the form below and we will prepare a custom quotation for your company.
              </p>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="text-xs font-medium text-zinc-400">Full Name</label>
                  <input 
                    type="text" 
                    id="contact-name" 
                    name="name" 
                    placeholder="John Doe"
                    required
                    className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="contact-email" className="text-xs font-medium text-zinc-400">Email Address</label>
                  <input 
                    type="email" 
                    id="contact-email" 
                    name="email" 
                    placeholder="john@company.com"
                    required
                    className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-company" className="text-xs font-medium text-zinc-400">Company Name</label>
                <input 
                  type="text" 
                  id="contact-company" 
                  name="company" 
                  placeholder="Apex Logistics Ltd"
                  required
                  className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="text-xs font-medium text-zinc-400">Message / Fleet Details</label>
                <textarea 
                  id="contact-message" 
                  name="message" 
                  rows={4}
                  placeholder="Tell us about the number of forklifts, excavators, and loaders in your fleet..."
                  required
                  className="w-full p-3 rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                />
              </div>

              <button 
                type="submit" 
                id="btn-contact-submit"
                className="w-full inline-flex h-11 items-center justify-center rounded-lg bg-zinc-100 text-sm font-medium text-zinc-950 hover:bg-zinc-200 transition-all shadow-md active:scale-95"
              >
                Send Request
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-500 py-12 border-t border-zinc-950 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex justify-center items-center gap-2">
            <div className="w-6 h-6 rounded-md overflow-hidden flex items-center justify-center bg-zinc-900 border border-zinc-800">
              <img src="/logo/logo.png" alt="WillyFastSolutions Logo" className="w-full h-full object-cover filter brightness-110" />
            </div>
            <span className="font-semibold text-sm text-zinc-400">WillyFastSolutions</span>
          </div>
          <p className="text-xs leading-relaxed max-w-md mx-auto">
            Providing enterprise-grade telemetry integration and preventive maintenance worker daemons for heavy equipment fleets globally.
          </p>
          <div className="text-[10px] text-zinc-600">
            &copy; {new Date().getFullYear()} WillyFastSolutions. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
