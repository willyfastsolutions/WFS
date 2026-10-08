"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Award, 
  CheckCircle2, 
  Phone, 
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  ExternalLink,
  MessageCircle,
  Truck
} from "lucide-react";

export default function EquipmentSalesPage() {
  const [lang, setLang] = useState<"en" | "es">("en");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col justify-between">
      
      {/* 1. TOP DISPATCH BAR */}
      <div className="bg-[#0B2545] text-white text-xs py-2 px-4 border-b border-blue-900/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="font-semibold text-amber-300">
              {lang === "es" ? "VENTA Y ALQUILER DE MONTACARGAS CERTIFICADOS" : "CERTIFIED FORKLIFT SALES & WAREHOUSE EQUIPMENT"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-slate-300">📍 97-20 102nd St, Ozone Park, Queens NY</span>
            <a href="tel:+17184042038" className="font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5">
              <Phone className="h-3 w-3" /> +1 (718) 404-2038
            </a>
          </div>
        </div>
      </div>

      {/* 2. CORPORATE HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="logo/logo.png" alt="Willy Fast Solutions Logo" className="h-11 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-[#0B2545] leading-none">
                WILLY FAST SOLUTIONS
              </span>
              <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase mt-1">
                Equipment Sales & Showroom
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <Link href="/" className="hover:text-[#0B2545] transition-colors">
              {lang === "es" ? "Inicio" : "Home"}
            </Link>
            <Link href="/services/" className="hover:text-[#0B2545] transition-colors">
              {lang === "es" ? "Servicios" : "Services"}
            </Link>
            <Link href="/equipment-sales/" className="text-[#0B2545] font-bold underline decoration-amber-500 underline-offset-8">
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
              className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 shadow-sm gap-2"
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
            <span className="text-[#0B2545]">Equipment Sales</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0B2545] tracking-tight">
            {lang === "es" 
              ? "Venta y Alquiler de Montacargas Certificados en Queens, NY" 
              : "Certified Pre-Owned Forklifts for Sale & Rent in Queens, NY"}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
            {lang === "es"
              ? "Todos nuestros montacargas cuentan con inspección mecánica integral, cilindros hidráulicos repacados, llantas nuevas y garantía de tren motriz. Listos para entrega en Nueva York y Nueva Jersey."
              : "Every machine passes a comprehensive multi-point mechanical inspection, with repacked hydraulic cylinders, new tires, and powertrain warranty. Ready for immediate warehouse delivery."}
          </p>
        </div>
      </section>

      {/* 4. INVENTORY CARDS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Unit 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-center h-52">
              <img src="images/forklift.webp" alt="Toyota 8FGU25 Forklift" className="max-h-full object-contain" />
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-bold text-lg text-[#0B2545]">Toyota 8FGU25</h2>
                  <p className="text-xs text-slate-500">5,000 lbs • LP Gas • Triple Mast 189"</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === "es" 
                  ? "Inspeccionado al 100%, cilindros hidráulicos repacados, llantas sólidas nuevas y garantía de tren motriz de 90 días." 
                  : "100% inspection verified, repacked hydraulic cylinders, new solid cushion tires, and 90-day powertrain warranty."}
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>Side-shifter attachment</span></li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>Fresh hydraulic fluid and filters</span></li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>OSHA safety compliance certified</span></li>
              </ul>
              <div className="pt-2">
                <Link href="/contact/" className="w-full inline-flex items-center justify-center py-2.5 rounded-lg bg-[#0B2545] text-white font-bold text-xs hover:bg-[#133b68]">
                  Request Quote / Schedule Demo →
                </Link>
              </div>
            </div>
          </div>

          {/* Unit 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-center h-52">
              <img src="images/forklift.webp" alt="Crown SC 5200 Electric" className="max-h-full object-contain grayscale-30" />
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-bold text-lg text-[#0B2545]">Crown SC 5200 Electric</h2>
                  <p className="text-xs text-slate-500">4,000 lbs • 36V Electric • Clean Depot</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Certified
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === "es" 
                  ? "Ideal para almacenes cerrados de alimentos o farmacéutica. Cargador industrial trifásico incluido y batería regenerada." 
                  : "Zero emissions for food & pharmaceutical facilities. Includes industrial 3-phase charger and tested battery."}
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>Non-marking floor tires</span></li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>Regenerative braking system</span></li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>Battery discharge test report</span></li>
              </ul>
              <div className="pt-2">
                <Link href="/contact/" className="w-full inline-flex items-center justify-center py-2.5 rounded-lg bg-[#0B2545] text-white font-bold text-xs hover:bg-[#133b68]">
                  Request Quote / Schedule Demo →
                </Link>
              </div>
            </div>
          </div>

          {/* Unit 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-center h-52">
              <img src="images/forklift.webp" alt="Hyster H50FT Heavy Duty" className="max-h-full object-contain hue-rotate-15" />
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-bold text-lg text-[#0B2545]">Hyster H50FT Heavy Duty</h2>
                  <p className="text-xs text-slate-500">5,000 lbs • Dual Fuel • Solid Pneumatic</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === "es" 
                  ? "Diseñado para patios exteriores, grava y aserraderos. Llantas sólidas para terreno irregular y frenos sellados en aceite." 
                  : "Engineered for rugged lumber, masonry, and outdoor yards. Solid pneumatic traction tires and oil-cooled wet disc brakes."}
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>Dual fuel (Gasoline / LPG)</span></li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>Heavy-duty mast rollers</span></li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span>Multi-point mechanical warranty</span></li>
              </ul>
              <div className="pt-2">
                <Link href="/contact/" className="w-full inline-flex items-center justify-center py-2.5 rounded-lg bg-[#0B2545] text-white font-bold text-xs hover:bg-[#133b68]">
                  Request Quote / Schedule Demo →
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* WFS CERTIFICATION PROMISE */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            <span>Garantía & Confianza Comercial • WFS Standard</span>
          </div>
          <h3 className="text-2xl font-black text-[#0B2545]">
            ¿Por qué comprar o alquilar maquinaria con Willy Fast Solutions?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
            <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="font-bold text-sm text-[#0B2545]">Inspección de 80 Puntos</div>
              <p>Revisamos compresión de motor, presión hidráulica de bombas, grosor de cadenas del mástil y desgaste de frenos antes de entregar cada unidad.</p>
            </div>
            <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="font-bold text-sm text-[#0B2545]">Soporte Técnico en Sitio</div>
              <p>Al comprar con nosotros, obtiene acceso prioritario a nuestros camiones de prensado de mangueras y mecánicos móviles en menos de 45 minutos.</p>
            </div>
            <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="font-bold text-sm text-[#0B2545]">Entrega Directa en NYC</div>
              <p>Transportamos la maquinaria directamente a su muelle de carga en Queens, Brooklyn, Bronx, Manhattan, Staten Island o Long Island.</p>
            </div>
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
