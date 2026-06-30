"use client";

import React, { useState, useEffect } from "react";
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
  Download
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [simHours, setSimHours] = useState(180);
  const [fleetSize, setFleetSize] = useState(15);
  const [downtimeCost, setDowntimeCost] = useState(150);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    // Preload WebP images for instant tab transitions
    const imagesToPreload = [
      "images/forklift.webp",
      "images/excavator.webp",
      "images/skid_steer.webp"
    ];
    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

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

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
      setTimeout(() => setFormSubmitted(false), 5000);
    }, 1500);
  };

  const machineryDetails: Record<MachineType, MachineDetail> = {
    forklift: {
      title: "Industrial Forklifts",
      subtitle: "Toyota / Hyster / Caterpillar",
      image: "images/forklift.webp",
      description: "High-frequency warehouse assets requiring strict load-safety compliance. WillyFastSolutions monitors mast hydraulics, lifting speed degradation, and tire wear intervals.",
      criticalCheck: "Hydraulic pressure valves & mast tilt stability",
      routineServices: ["Mast oil & cylinder lubrication", "Engine oil change & oil filter", "Air intake filter clean", "Brake fluid check"],
      safetyChecks: ["Fork wear & thickness caliper measurement", "Working alarms & horn", "Lights (strobe & headlights)", "Battery acid level & terminal clean"],
      operationalHours: "150.0 hrs"
    },
    excavator: {
      title: "Heavy Excavators",
      subtitle: "Caterpillar / Komatsu / John Deere",
      image: "images/excavator.webp",
      description: "High-stress earthmoving machinery operating in abrasive dust conditions. WillyFastSolutions alerts for track tension wear, swing gear lubrication, and cooling radiator status.",
      criticalCheck: "Hydraulic pump flow & boom swing gear grease",
      routineServices: ["Swing drive fluid change", "Engine oil & hydraulic filters", "Air pre-cleaner cartridge", "Glow plug replacement"],
      safetyChecks: ["Track tension alignment & links check", "Cabin rollover protection system (ROPS)", "Audible travel warning alarms", "Engine start ignition voltage"],
      operationalHours: "480.0 hrs"
    },
    skid_steer: {
      title: "Skid Steer Loaders",
      subtitle: "Bobcat / Case / Kubota",
      image: "images/skid_steer.webp",
      description: "Compact, agile machines with dynamic attachment changes. WillyFastSolutions handles quick-attach latch inspections, auxiliary hydraulic flow logs, and wheel hub wear logs.",
      criticalCheck: "Quick-attach mechanical latch & auxiliary line integrity",
      routineServices: ["Drive chain tension adjustment", "Engine oil & separator filter", "Engine cooling pack blow-out", "Fuel filter replacement"],
      safetyChecks: ["Seat bar safety interlock switch", "All-around operating worklights", "Backup reverse horn alarm", "Alternator belt tension check"],
      operationalHours: "260.0 hrs"
    }
  };

  const currentMachine = machineryDetails[activeTab];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-zinc-800 selection:text-zinc-200 overflow-x-hidden">
      
      {/* Navigation Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-900 transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg shadow-sm flex items-center justify-center w-10 h-10 overflow-hidden">
              <img src="logo/logo.png" alt="WillyFastSolutions Logo" className="w-full h-full object-cover filter brightness-110" />
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
            <a href="#agent" id="nav-agent" className="hover:text-zinc-100 transition-colors">Audit Agent</a>
            <a href="#about" id="nav-about" className="hover:text-zinc-100 transition-colors">Who We Are</a>
            <a href="#pricing" id="nav-pricing" className="hover:text-zinc-100 transition-colors">Services</a>
            <a href="#contact" id="nav-contact" className="hover:text-zinc-100 transition-colors">Contact</a>
          </nav>
          
          {/* Social Icons + Login */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 border-r border-zinc-900 pr-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300 transition-colors" aria-label="Facebook">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300 transition-colors" aria-label="Instagram">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.008 3.752.052 2.73.124 4.093 1.503 4.218 4.218.044.968.052 1.322.052 3.752c0 2.43-.008 2.784-.052 3.752-.124 2.73-1.503 4.093-4.218 4.218-.968.044-1.322.052-3.752.052-2.43 0-2.784-.008-3.752-.052-2.73-.124-4.093-1.503-4.218-4.218-.044-.968-.052-1.322-.052-3.752 0-2.43.008-2.784.052-3.752.124-2.73 1.503-4.093 4.218-4.218.968-.044 1.322-.052 3.752-.052zm.126 1.8c-2.408 0-2.71.01-3.66.054-2.188.1-3.136 1.054-3.238 3.238-.044.95-.054 1.252-.054 3.66s.01 2.71.054 3.66c.1 2.184 1.05 3.134 3.238 3.238.95.044 1.252.054 3.66.054s2.71-.01 3.66-.054c2.184-.1 3.134-1.05 3.238-3.238.044-.95.054-1.252.054-3.66s-.01-2.71-.054-3.66c-.1-2.188-1.054-3.136-3.238-3.238-.95-.044-1.252-.054-3.66-.054h-.13zm-5.44 8.2a5.5 5.5 0 1111 0 5.5 5.5 0 01-11 0zm2 0a3.5 3.5 0 107 0 3.5 3.5 0 00-7 0zm6.3-3.75a1.25 1.25 0 112.5 0 1.25 1.25 0 01-2.5 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <a 
              href="login/"
              onClick={(e) => {
                if (typeof window !== "undefined" && window.location.protocol === "file:") {
                  e.preventDefault();
                  window.location.href = "login/index.html";
                }
              }}
              id="btn-login" 
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-4 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-900 hover:text-zinc-100 hover:border-zinc-700 shadow-sm cursor-pointer"
            >
              Sign In
            </a>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section id="home" className="relative py-20 md:py-32 overflow-hidden border-b border-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex self-center md:self-start items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Heavy Machinery Maintenance Provider
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight bg-gradient-to-b from-zinc-50 to-zinc-400 bg-clip-text text-transparent"
            >
              Automated Maintenance Audits for Heavy Machinery
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-zinc-400 max-w-xl"
            >
              Monitor operating hours and perform routine checklists for your fleet of heavy machinery. Get automated audit reports sent to your email before thresholds are crossed.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 mt-2 justify-center md:justify-start"
            >
              <a 
                href="#pricing" 
                id="btn-hero-start" 
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-lg bg-zinc-100 px-6 text-sm font-medium text-zinc-950 transition-all hover:bg-zinc-200 hover:scale-102 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
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
            </motion.div>
          </div>

          {/* Interactive Live Status Widget */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 w-full max-w-lg md:max-w-none"
          >
            <div className="relative border border-zinc-800 bg-zinc-900/30 rounded-xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm group hover:border-zinc-700/80 transition-all duration-500">
              <div className="absolute top-3 left-4 flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-zinc-800" />
                <span className="w-3 h-3 rounded-full bg-zinc-800" />
                <span className="w-3 h-3 rounded-full bg-zinc-800" />
              </div>
              <div className="text-xs text-zinc-500 text-right mb-6">telemetry_dashboard.json</div>
              
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
          </motion.div>
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
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
              >
                
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

                  {/* Critical Check Indicator */}
                  <div className="p-3.5 rounded-lg border border-rose-500/10 bg-rose-500/5 text-xs text-rose-400/95 font-medium shadow-sm">
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
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
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

              </motion.div>
            </AnimatePresence>
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
            <motion.div 
              whileHover={{ y: -6, borderColor: "#27272a" }}
              className="border border-zinc-900 bg-zinc-950 p-6 rounded-xl space-y-4 hover:bg-zinc-900/20 transition-colors duration-300"
            >
              <div className="inline-flex bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                <Hourglass className="h-6 w-6 text-zinc-300" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-200">Precise Hour Meter Logging</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Log accurate operating hours (hour meter) for each machine. Automatically update fleet diagnostic metrics to trigger maintenance intervals correctly.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -6, borderColor: "#27272a" }}
              className="border border-zinc-900 bg-zinc-950 p-6 rounded-xl space-y-4 hover:bg-zinc-900/20 transition-colors duration-300"
            >
              <div className="inline-flex bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                <ShieldCheck className="h-6 w-6 text-zinc-300" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-200">Preventive Maintenance Checklist</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Step-by-step validation of critical components: oil change, oil/air filters, spark plugs, battery checks, working lights, horn, and ignition systems.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -6, borderColor: "#27272a" }}
              className="border border-zinc-900 bg-zinc-950 p-6 rounded-xl space-y-4 hover:bg-zinc-900/20 transition-colors duration-300"
            >
              <div className="inline-flex bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                <BellRing className="h-6 w-6 text-zinc-300" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-200">Automated Audit Alerts</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Our background daemon worker continuously scans the database, automatically generating executive reports and emailing them directly to company admins when thresholds are breached.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Fleet Benefits Section */}
      <section id="benefits" className="py-20 md:py-28 bg-zinc-900/20 border-b border-zinc-900">
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

            {/* Fleet ROI Calculator */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border border-zinc-900 bg-zinc-900/30 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl space-y-6"
            >
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
                onClick={() => handleSelectPackage(`Medium Fleet (Calculated for ${fleetSize} machines)`)}
                className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors shadow-md cursor-pointer"
              >
                Request Custom Quote for {fleetSize} Machines
              </button>
            </motion.div>

          </div>

          {/* Stats bar under columns */}
          <div className="mt-16 pt-12 border-t border-zinc-900">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div whileHover={{ scale: 1.03 }} className="p-6 rounded-xl border border-zinc-900 bg-zinc-950 text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-zinc-200">-35%</div>
                <div className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider font-semibold">Unscheduled Downtime</div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} className="p-6 rounded-xl border border-zinc-900 bg-zinc-950 text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-zinc-200">100%</div>
                <div className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider font-semibold">OSHA Compliance</div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} className="p-6 rounded-xl border border-zinc-900 bg-zinc-950 text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-zinc-200">24/7</div>
                <div className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider font-semibold">Daemon Monitoring</div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} className="p-6 rounded-xl border border-zinc-900 bg-zinc-950 text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-zinc-200">&lt;5m</div>
                <div className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider font-semibold">Audit PDF Dispatch</div>
              </motion.div>
            </div>
          </div>

        </div>
      </section>

      {/* Automated Auditing Agent (Daemon) Showcase */}
      <section id="agent" className="py-20 md:py-28 border-b border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Interactive Alert Simulator */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-full relative overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-900/40 p-6 shadow-2xl backdrop-blur-sm"
            >
              {/* Telemetry Header */}
              <div className="flex justify-between items-start border-b border-zinc-900 pb-4 mb-6">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Live Telemetry Console</div>
                  <h3 className="text-lg font-bold text-zinc-200 mt-0.5">Toyota 8FGU25 Forklift</h3>
                  <div className="text-[10px] font-mono text-zinc-600 mt-0.5">SN-CAT-554321 • Depot A</div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-zinc-855 bg-zinc-900 text-[9px] font-mono text-zinc-400">
                  <Activity className="h-3 w-3 text-emerald-500 animate-pulse" /> Telemetry Active
                </div>
              </div>

              {/* Dynamic Status Display */}
              <div className="flex flex-col items-center justify-center py-6 bg-zinc-950/60 rounded-xl border border-zinc-900 mb-6 relative overflow-hidden">
                {/* Background glow depending on status */}
                <div className={`absolute inset-0 opacity-5 blur-2xl transition-colors duration-500 ${
                  simHours < 200 ? 'bg-emerald-500' : simHours < 250 ? 'bg-amber-500' : 'bg-rose-500'
                }`} />

                <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1">Current Hour Meter</div>
                <div className="text-4xl font-extrabold tracking-tight text-zinc-100 font-mono mb-2">
                  {simHours.toFixed(1)} <span className="text-zinc-500 text-lg font-normal font-sans">hrs</span>
                </div>

                {/* Status Badge */}
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
                  <span className="text-zinc-400 font-medium">Simulate Hours</span>
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
                  <span>250h (Limit)</span>
                  <span>350h (Max)</span>
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
                          <h4 className="text-xs font-bold text-zinc-300 mt-1">To: manager@apexlogistics.com</h4>
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
                          <FileText className="h-3 w-3" /> Download Audit Report (PDF)
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Right: Agent Description details */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-900 bg-zinc-900/30 text-xs text-zinc-500">
                <Clock className="h-3.5 w-3.5" /> 24/7 Background Audit Worker
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-100">
                Automated Auditing Agent (Daemon)
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                WillyFastSolutions integrates a backend worker process that monitors your machines constantly. No manual logging is left unchecked.
              </p>

              <div className="space-y-4 text-xs sm:text-sm text-zinc-400">
                <div className="flex gap-3 items-start">
                  <div className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 mt-0.5">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-300">Continuous Database Scanning</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">The daemon worker queries operating hours and identifies equipment exceeding the 250-hour service threshold.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 mt-0.5">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-300">Instant Executive PDF Generation</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Generates clean executive PDF audit reports including essential KPIs, safety statuses, and checklists.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 mt-0.5">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-300">Automated Dispatch</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Sends reports automatically to company emails, ensuring you remain compliant without clicking a single button.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Who We Are (About Us) Section */}
      <section id="about" className="py-20 md:py-28 border-b border-zinc-900 bg-zinc-900/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 mx-auto">
            <UserCheck className="h-6 w-6" />
          </div>
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-100">
              Who We Are
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
              WillyFastSolutions is an independent heavy machinery maintenance partner. We combine hands-on mechanical field experience with modern cloud telemetry alerts.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-left">
            <div className="p-6 rounded-xl border border-zinc-900 bg-zinc-950 space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Our Mission</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                To guarantee zero unexpected machinery failures and maintain total OSHA audit readiness for warehousing, mining, and logistics operators.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-zinc-900 bg-zinc-950 space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Field Service</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                We handle the dirty work. From oil filter changes to full battery and ignition diagnostic scans, our technicians service your equipment on-site.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-zinc-900 bg-zinc-950 space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Telemetry First</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                We don't guess. Our telemetry portal logs machine hours continuously, ensuring that preventative checks occur exactly when required.
              </p>
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
            <motion.div 
              whileHover={{ y: -8 }}
              className="border border-zinc-900 bg-zinc-900/10 p-8 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-colors duration-300"
            >
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
                  className="w-full inline-flex h-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 hover:scale-102 active:scale-95 transition-all cursor-pointer"
                >
                  Request Quote
                </button>
              </div>
            </motion.div>

            {/* Package 2 - Recommended */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="relative border-2 border-zinc-800 bg-zinc-900/30 p-8 rounded-2xl flex flex-col justify-between shadow-xl"
            >
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
                  className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-950 hover:bg-zinc-200 hover:scale-102 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  Request Quote
                </button>
              </div>
            </motion.div>

            {/* Package 3 */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="border border-zinc-900 bg-zinc-900/10 p-8 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-colors duration-300"
            >
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
                  className="w-full inline-flex h-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 hover:scale-102 active:scale-95 transition-all cursor-pointer"
                >
                  Contact Sales
                </button>
              </div>
            </motion.div>

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

            {formSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-center text-emerald-400 text-sm"
              >
                Thank you! Your quote request has been received. Our team will review your fleet details and contact you shortly.
              </motion.div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
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
                  disabled={isSubmitting}
                  className="w-full inline-flex h-11 items-center justify-center rounded-lg bg-zinc-100 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-zinc-100 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Send Request"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-500 py-12 border-t border-zinc-900 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex justify-center items-center gap-2">
            <div className="w-6 h-6 rounded-md overflow-hidden flex items-center justify-center bg-zinc-900 border border-zinc-800">
              <img src="logo/logo.png" alt="WillyFastSolutions Logo" className="w-full h-full object-cover filter brightness-110" />
            </div>
            <span className="font-semibold text-sm text-zinc-400">WillyFastSolutions</span>
          </div>
          
          <p className="text-xs leading-relaxed max-w-md mx-auto">
            Providing enterprise-grade telemetry integration and preventive maintenance worker daemons for heavy equipment fleets globally.
          </p>

          {/* Social media connections */}
          <div className="flex justify-center items-center gap-6 pt-2">
            <a href="https://facebook.com/willyfastsolutions" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300 transition-colors" aria-label="Facebook">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://instagram.com/willyfastsolutions" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300 transition-colors" aria-label="Instagram">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.008 3.752.052 2.73.124 4.093 1.503 4.218 4.218.044.968.052 1.322.052 3.752c0 2.43-.008 2.784-.052 3.752-.124 2.73-1.503 4.093-4.218 4.218-.968.044-1.322.052-3.752.052-2.43 0-2.784-.008-3.752-.052-2.73-.124-4.093-1.503-4.218-4.218-.044-.968-.052-1.322-.052-3.752 0-2.43.008-2.784.052-3.752.124-2.73 1.503-4.093 4.218-4.218.968-.044 1.322-.052 3.752-.052zm.126 1.8c-2.408 0-2.71.01-3.66.054-2.188.1-3.136 1.054-3.238 3.238-.044.95-.054 1.252-.054 3.66s.01 2.71.054 3.66c.1 2.184 1.05 3.134 3.238 3.238.95.044 1.252.054 3.66.054s2.71-.01 3.66-.054c2.184-.1 3.134-1.05 3.238-3.238.044-.95.054-1.252.054-3.66s-.01-2.71-.054-3.66c-.1-2.188-1.054-3.136-3.238-3.238-.95-.044-1.252-.054-3.66-.054h-.13zm-5.44 8.2a5.5 5.5 0 1111 0 5.5 5.5 0 01-11 0zm2 0a3.5 3.5 0 107 0 3.5 3.5 0 00-7 0zm6.3-3.75a1.25 1.25 0 112.5 0 1.25 1.25 0 01-2.5 0z" clipRule="evenodd" />
              </svg>
            </a>
          </div>

          <div className="text-[10px] text-zinc-600 pt-4 border-t border-zinc-900/60 max-w-xs mx-auto">
            &copy; {new Date().getFullYear()} WillyFastSolutions. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Report Modal Popup */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="print-modal bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-zinc-950/40">
                <div className="flex items-center gap-2">
                  <div className="bg-zinc-900 border border-zinc-800 p-1 rounded w-6 h-6 overflow-hidden flex items-center justify-center">
                    <img src="logo/logo.png" alt="WFS Logo" className="w-full h-full object-cover filter brightness-110" />
                  </div>
                  <span className="font-bold text-xs tracking-wider text-zinc-400">WillyFastSolutions Report Engine</span>
                </div>
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="no-print text-zinc-500 hover:text-zinc-300 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Modal Body (Simulated PDF Report) */}
              <div className="p-6 overflow-y-auto space-y-6 bg-zinc-950/20 text-zinc-300 font-sans">
                
                {/* PDF Letterhead */}
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

                {/* Client and Asset Metadata */}
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

                {/* Telemetry Chart & Trigger Info */}
                <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/5 space-y-2">
                  <h3 className="text-xs font-bold text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Maintenance Threshold Breach Detected
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Our background telemetry daemon identified that this asset has operated for <strong>{(simHours - 250).toFixed(1)} hours past its limit</strong> without the required 250-hour service checklist being logged. Immediate field maintenance is recommended to prevent mast hydraulic degradation.
                  </p>
                </div>

                {/* Checklist Item Results */}
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
                    <div className="flex items-center justify-between p-2 rounded bg-zinc-900/40 border border-zinc-800/60">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                        <span className="font-medium text-zinc-200">Load Mast tilt stability checklist</span>
                      </div>
                      <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">Needs Inspection</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-zinc-900/40 border border-zinc-800/60">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        <span>Safety Alarms, Horn, Strobes</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">Passed</span>
                    </div>
                  </div>
                </div>

                {/* Footer Signoff */}
                <div className="flex justify-between items-center pt-4 border-t border-zinc-900 text-[9px] text-zinc-600">
                  <div>WillyFastSolutions Telemetry Audit daemon v2.0.1 (Secure Sign-off)</div>
                  <div>Authorized Copy • Non-transferable</div>
                </div>

              </div>

              {/* Modal Footer Actions */}
              <div className="no-print px-6 py-4 border-t border-zinc-800 bg-zinc-950/40 flex justify-end gap-3">
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="inline-flex h-9 items-center justify-center px-4 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
                <button 
                  onClick={() => {
                    window.print();
                  }}
                  className="inline-flex h-9 items-center justify-center gap-1.5 px-4 rounded-lg bg-zinc-100 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Print Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
