import React from "react";
import Link from "next/link";
import { 
  Wrench, 
  ShieldCheck, 
  Hourglass, 
  BellRing, 
  FileSpreadsheet, 
  Mail, 
  ChevronRight, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  BarChart3 
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-zinc-800 selection:text-zinc-200">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-900 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg shadow-sm">
              <Wrench className="h-6 w-6 text-zinc-300" />
            </div>
            <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Willyfast Solutions
            </span>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#home" id="nav-home" className="hover:text-zinc-100 transition-colors">Home</a>
            <a href="#features" id="nav-features" className="hover:text-zinc-100 transition-colors">Features</a>
            <a href="#benefits" id="nav-benefits" className="hover:text-zinc-100 transition-colors">Fleet Benefits</a>
            <a href="#modules" id="nav-modules" className="hover:text-zinc-100 transition-colors">Modules</a>
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
      <section id="home" className="relative py-20 md:py-32 overflow-hidden border-b border-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 flex flex-col gap-6">
            <div className="inline-flex self-center md:self-start items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              SaaS B2B Fleet Management Platform
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight bg-gradient-to-b from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
              Automated Preventive Maintenance for Heavy Machinery
            </h1>
            
            <p className="text-base sm:text-lg text-zinc-400 max-w-xl">
              Optimize fleet availability, reduce unexpected downtime, and guarantee OSHA compliance. Willyfast automatically monitors operating hours and sends executive audit reports.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 justify-center md:justify-start">
              <Link 
                href="/login" 
                id="btn-hero-start" 
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-lg bg-zinc-100 px-6 text-sm font-medium text-zinc-950 transition-all hover:bg-zinc-200 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              >
                Get Started
              </Link>
              <a 
                href="#features" 
                id="btn-hero-learn" 
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-6 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-900 hover:text-zinc-100 hover:border-zinc-700"
              >
                Explore Features
              </a>
            </div>
          </div>

          {/* Interactive UI Mockup */}
          <div className="flex-1 w-full max-w-lg md:max-w-none">
            <div className="relative border border-zinc-800 bg-zinc-900/30 rounded-xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
              <div className="absolute top-3 left-4 flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-zinc-800" />
                <span className="w-3 h-3 rounded-full bg-zinc-800" />
                <span className="w-3 h-3 rounded-full bg-zinc-800" />
              </div>
              <div className="text-xs text-zinc-500 text-right mb-6">live_fleet_overview.json</div>
              
              <div className="space-y-4">
                {/* Machine Status Card 1 */}
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
                
                {/* Machine Status Card 2 */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/80 bg-zinc-950/60 transition-all hover:border-zinc-700">
                  <div className="flex items-center gap-3">
                    <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                      <Activity className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-200">Apex Loader 1</div>
                      <div className="text-[10px] text-zinc-500">Skid Steer Loader • SN-BOB-987211</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-zinc-300">260.0 hrs</div>
                    <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      Healthy (Last Serv: 250h)
                    </span>
                  </div>
                </div>
                
                {/* Safety Verification Badge */}
                <div className="p-3.5 rounded-lg border border-zinc-800/80 bg-zinc-900/60 text-xs space-y-2">
                  <div className="font-medium text-zinc-300 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Mandatory Safety Checklist Completed
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] text-zinc-500">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Battery Operational
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Lights Functional
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Horn & Safety Alarms
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Ignition Check Pass
                    </div>
                  </div>
                </div>

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
              Stop relying on spreadsheets and manual checks. Willyfast provides automated, bulletproof tracking for heavy machinery operators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="border border-zinc-900 bg-zinc-950 p-6 rounded-xl space-y-4 hover:border-zinc-800 transition-all hover:bg-zinc-900/30">
              <div className="inline-flex bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                <Hourglass className="h-6 w-6 text-zinc-300" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-200">Precise Hour Meter Logging</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Log accurate operating hours (horómetro) for each machine. Automatically update fleet diagnostic metrics to trigger maintenance intervals correctly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="border border-zinc-900 bg-zinc-950 p-6 rounded-xl space-y-4 hover:border-zinc-800 transition-all hover:bg-zinc-900/30">
              <div className="inline-flex bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                <ShieldCheck className="h-6 w-6 text-zinc-300" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-200">Preventive Maintenance Checklist</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Step-by-step validation of critical components: oil change, oil/air filters, spark plugs, battery checks, working lights, horn, and ignition systems.
              </p>
            </div>

            {/* Feature 3 */}
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

            {/* KPI grid showcase */}
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
            {/* Module A Card */}
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

            {/* Module B Card */}
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

            {/* Module C Card */}
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
                Get in Touch
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Interested in testing Willyfast for your fleet? Complete the form below and our engineering team will set up your tenant workspace.
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
                <label htmlFor="contact-message" className="text-xs font-medium text-zinc-400">Message / Fleet Size</label>
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
            <Wrench className="h-5 w-5 text-zinc-500" />
            <span className="font-semibold text-sm text-zinc-400">Willyfast Solutions</span>
          </div>
          <p className="text-xs leading-relaxed max-w-md mx-auto">
            Providing enterprise-grade telemetry integration and preventive maintenance worker daemons for heavy equipment fleets globally.
          </p>
          <div className="text-[10px] text-zinc-600">
            &copy; {new Date().getFullYear()} Willyfast Solutions LLC. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
