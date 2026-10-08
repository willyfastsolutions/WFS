"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Wrench, 
  Flame, 
  Package, 
  RotateCw, 
  Award, 
  Cpu, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  ExternalLink
} from "lucide-react";

export default function ServicesPage() {
  const [lang, setLang] = useState<"en" | "es">("en");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col justify-between">
      
      {/* 1. TOP DISPATCH BAR */}
      <div className="bg-[#0B2545] text-white text-xs py-2 px-4 border-b border-blue-900/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-amber-300">
              {lang === "es" ? "SERVICIO MECÁNICO INDUSTRIAL 24/7 EN NUEVA YORK" : "24/7 COMMERCIAL MOBILE FIELD SERVICE IN NYC"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-slate-300">📍 97-20 102nd St, Ozone Park, Queens NY</span>
            <a 
              href="tel:+17184042038" 
              className="font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5"
            >
              <Phone className="h-3 w-3" /> +1 (718) 404-2038
            </a>
          </div>
        </div>
      </div>

      {/* 2. CORPORATE HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="logo/logo.png" 
              alt="Willy Fast Solutions Corp Logo" 
              className="h-11 w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-[#0B2545] leading-none">
                WILLY FAST SOLUTIONS
              </span>
              <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase mt-1">
                Commercial Forklift Services Division
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <Link href="/" className="hover:text-[#0B2545] transition-colors">
              {lang === "es" ? "Inicio" : "Home"}
            </Link>
            <Link href="/services/" className="text-[#0B2545] font-bold underline decoration-amber-500 underline-offset-8">
              {lang === "es" ? "Servicios" : "Services"}
            </Link>
            <Link href="/equipment-sales/" className="hover:text-[#0B2545] transition-colors">
              {lang === "es" ? "Venta Equipos" : "Equipment Sales"}
            </Link>
            <Link href="/contact/" className="hover:text-[#0B2545] transition-colors">
              {lang === "es" ? "Contacto & Horarios" : "Map & Hours"}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === "en" ? "es" : "en")}
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              {lang === "en" ? "🇺🇸 EN" : "🇪🇸 ES"}
            </button>
            <a 
              href="tel:+17184042038"
              className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-sm gap-2"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>(718) 404-2038</span>
            </a>
          </div>
        </div>
      </header>

      {/* 3. HERO BANNER */}
      <section className="bg-gradient-to-b from-slate-100 via-white to-slate-50 py-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span className="text-[#0B2545]">Commercial Services</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0B2545] tracking-tight">
            {lang === "es" 
              ? "Servicios Comerciales de Montacargas y Maquinaria Pesada en NY" 
              : "Commercial Forklift Repair, Hydraulic Hoses & Field Services in NYC"}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
            {lang === "es"
              ? "Taller físico industrial en Ozone Park y unidades móviles de despacho rápido en menos de 45 minutos para todo Queens, Brooklyn, Bronx, Manhattan y Long Island."
              : "Physical heavy equipment depot located in Ozone Park, Queens with on-site mobile service vans dispatched in under 45 minutes across all 5 boroughs & Long Island."}
          </p>
        </div>
      </section>

      {/* 4. THE 6 SERVICES GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Service 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-[#0B2545] text-amber-400 flex items-center justify-center font-bold">
                <Wrench className="h-6 w-6" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                24/7 Mobile Dispatch
              </div>
              <h2 className="text-xl font-bold text-[#0B2545]">
                {lang === "es" ? "Reparación Mecánica en Sitio" : "Emergency On-Site Field Repairs"}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === "es"
                  ? "Diagnóstico y reconstrucción de mástiles, pistones hidráulicos, frenos, arrancadores, bombas de agua y sistemas eléctricos para Toyota, Crown, Hyster, Yale y Cat."
                  : "On-site mast overhauls, hydraulic cylinder repacking, brakes, starters, engines, and electrical diagnostics on all major forklift brands."}
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>&lt; 45 min warehouse arrival</span></li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>Mast & valve recalibration</span></li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>Certified NY field mechanics</span></li>
              </ul>
            </div>
            <div className="pt-6">
              <a href="tel:+17184042038" className="w-full inline-flex items-center justify-center py-2.5 rounded-lg bg-[#0B2545] text-white font-bold text-xs hover:bg-[#133b68] gap-1.5">
                <Phone className="h-3.5 w-3.5 text-amber-400" />
                <span>Call Dispatch: (718) 404-2038</span>
              </a>
            </div>
          </div>

          {/* Service 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <Flame className="h-6 w-6" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                On-Site Crimping & Fittings
              </div>
              <h2 className="text-xl font-bold text-[#0B2545]">
                {lang === "es" ? "Mangueras Hidráulicas 6,000 PSI" : "High-Pressure Hydraulic Hoses"}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === "es"
                  ? "Prensado móvil directo en su bodega u obra. Mangueras de 2, 4 y 6 espirales hasta 6,000 PSI con conexiones JIC, ORFS, DIN, BSP y bridas split Code 61/62."
                  : "Custom mobile hydraulic hose fabrication up to 6,000 PSI crimped directly at your facility. Complete stock of high-pressure fittings and split flanges."}
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>On-board van hydraulic press</span></li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>Zero transport fluid downtime</span></li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>Forklifts, backhoes & excavators</span></li>
              </ul>
            </div>
            <div className="pt-6">
              <a href="tel:+17184042038" className="w-full inline-flex items-center justify-center py-2.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                <span>Call Hose Press: (718) 404-2038</span>
              </a>
            </div>
          </div>

          {/* Service 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-[#0B2545] text-amber-400 flex items-center justify-center font-bold">
                <Package className="h-6 w-6" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                Sales, Rentals & Rebuilds
              </div>
              <h2 className="text-xl font-bold text-[#0B2545]">
                {lang === "es" ? "Pallet Jacks Manuales & Eléctricos" : "Pallet Jack Sales & Pump Rebuilds"}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === "es"
                  ? "Venta y reconstrucción de transpaletas manuales de 5,500 lbs y eléctricas walkie. Sellos hidráulicos, cambio de ruedas de poliuretano y equipos con garantía."
                  : "Manual hand pallet jacks (5,500 lbs) and electric walkies. Hydraulic pump rebuilding, polyurethane wheel replacement, and certified pre-owned units."}
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>New & reconditioned units</span></li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>Polyurethane & nylon rollers</span></li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>Hydraulic pump seal repacking</span></li>
              </ul>
            </div>
            <div className="pt-6">
              <Link href="/contact/" className="w-full inline-flex items-center justify-center py-2.5 rounded-lg bg-[#0B2545] text-white font-bold text-xs hover:bg-[#133b68] gap-1.5">
                <Package className="h-3.5 w-3.5 text-amber-400" />
                <span>Quote Pallet Jack</span>
              </Link>
            </div>
          </div>

          {/* Service 4 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-[#0B2545] text-amber-400 flex items-center justify-center font-bold">
                <RotateCw className="h-6 w-6" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                Mobile Tire Pressing
              </div>
              <h2 className="text-xl font-bold text-[#0B2545]">
                {lang === "es" ? "Llantas Sólidas & Prensa Móvil" : "Forklift Tires & Mobile Pressing"}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === "es"
                  ? "Prensado de llantas cushion y neumáticas sólidas directamente en su muelle de carga con nuestro camión prensa hidráulico. Compuestos non-marking que protegen el piso."
                  : "Smooth cushion, traction, and solid pneumatic tires pressed right at your warehouse dock with our mobile hydraulic tire press truck."}
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>On-site pressing at your dock</span></li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>Non-marking clean compounds</span></li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>Zero off-site freight downtime</span></li>
              </ul>
            </div>
            <div className="pt-6">
              <a href="tel:+17184042038" className="w-full inline-flex items-center justify-center py-2.5 rounded-lg bg-[#0B2545] text-white font-bold text-xs hover:bg-[#133b68] gap-1.5">
                <Phone className="h-3.5 w-3.5 text-amber-400" />
                <span>Schedule Tire Press: (718) 404-2038</span>
              </a>
            </div>
          </div>

          {/* Service 5 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-[#0B2545] text-amber-400 flex items-center justify-center font-bold">
                <Award className="h-6 w-6" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                Certified Inventory
              </div>
              <h2 className="text-xl font-bold text-[#0B2545]">
                {lang === "es" ? "Venta de Montacargas Certificados" : "Certified Forklifts for Sale"}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === "es"
                  ? "Montacargas usados certificados Toyota, Crown, Hyster y Cat con inspección multipunto, tren motriz garantizado y cilindros repacados listos para entrega."
                  : "Inspected pre-owned Toyota, Crown, and Hyster units with mechanical warranty, repacked cylinders, and multi-point inspection verification."}
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>LP gas, electric & diesel models</span></li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>Multi-point warranty inspection</span></li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>Immediate Tri-State delivery</span></li>
              </ul>
            </div>
            <div className="pt-6">
              <Link href="/equipment-sales/" className="w-full inline-flex items-center justify-center py-2.5 rounded-lg bg-[#0B2545] text-white font-bold text-xs hover:bg-[#133b68] gap-1.5">
                <Award className="h-3.5 w-3.5 text-amber-400" />
                <span>View Forklift Inventory</span>
              </Link>
            </div>
          </div>

          {/* Service 6 */}
          <div className="bg-gradient-to-b from-blue-50/70 to-slate-50 rounded-2xl border-2 border-blue-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-[#0B2545] text-blue-300 flex items-center justify-center font-bold">
                <Cpu className="h-6 w-6" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span>Digital Fleet Division</span>
              </div>
              <h2 className="text-xl font-bold text-[#0B2545]">
                {lang === "es" ? "Software de Flotas WFS" : "WFS Fleet Telemetry & Software"}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === "es"
                  ? "Suite en la nube dedicada a la gestión de flotas industriales: telemetría autónoma, cálculo de ROI de tiempo muerto y listas digitales de inspección diaria OSHA."
                  : "Dedicated cloud platform for fleet managers: autonomous horometer tracking, predictive maintenance alerts, and digital OSHA pre-shift inspections."}
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-blue-200/60">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /><span>Autonomous horometer tracking</span></li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /><span>Scheduled PM alerts</span></li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /><span>OSHA QR daily inspection forms</span></li>
              </ul>
            </div>
            <div className="pt-6">
              <a 
                href="/software/"
                className="w-full inline-flex items-center justify-center py-2.5 rounded-lg bg-[#0B2545] text-white font-bold text-xs hover:bg-[#133b68] gap-2 shadow-sm"
              >
                <Cpu className="h-3.5 w-3.5 text-amber-400" />
                <span>Launch Fleet Platform →</span>
              </a>
            </div>
          </div>

        </div>

        {/* CTA BOTTOM BAR */}
        <div className="rounded-2xl bg-[#0B2545] text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-black">
              {lang === "es" ? "¿Necesita asistencia técnica o prensado hoy?" : "Need Urgent Mechanic Dispatch or Hose Crimping Today?"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              {lang === "es" ? "Despachamos desde Ozone Park a cualquier bodega en Queens, Brooklyn y Long Island en menos de 45 minutos." : "Mobile units stationed in Ozone Park ready to reach your warehouse in under 45 minutes."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a 
              href="tel:+17184042038"
              className="h-11 px-5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              <span>(718) 404-2038</span>
            </a>
            <Link 
              href="/contact/"
              className="h-11 px-5 rounded-lg bg-white/10 border border-white/20 text-white font-bold text-xs hover:bg-white/20 flex items-center gap-2"
            >
              <span>Submit Service Ticket</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* 5. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 Willy Fast Solutions Corp. 97-20 102nd St, Ozone Park, Queens NY 11416.</div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/services/" className="hover:text-white transition-colors">Services</Link>
            <Link href="/equipment-sales/" className="hover:text-white transition-colors">Equipment</Link>
            <Link href="/contact/" className="hover:text-white transition-colors">Map & Hours</Link>
            <Link href="/software/" className="hover:text-white transition-colors">Software</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
