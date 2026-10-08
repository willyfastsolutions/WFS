"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Send, 
  CheckCircle2, 
  Loader2, 
  ExternalLink,
  MessageCircle,
  Truck,
  ShieldCheck,
  Building2
} from "lucide-react";

export default function ContactPage() {
  const [lang, setLang] = useState<"en" | "es">("en");

  // Form State
  const [quoteCompany, setQuoteCompany] = useState("");
  const [quoteName, setQuoteName] = useState("");
  const [quotePhone, setQuotePhone] = useState("");
  const [quoteEmail, setQuoteEmail] = useState("");
  const [quoteServiceType, setQuoteServiceType] = useState("Forklift Repair");
  const [quoteUrgency, setQuoteUrgency] = useState("Immediate Dispatch (Emergency)");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      full_name: quoteName,
      email: quoteEmail,
      company_name: quoteCompany,
      message: `[SERVICE: ${quoteServiceType}] [URGENCY: ${quoteUrgency}] [PHONE: ${quotePhone}] - ${quoteMessage}`
    };

    const isOffline = typeof window !== "undefined" && window.location.protocol === "file:";
    const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : "";

    if (isOffline) {
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 6000);
      }, 1000);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/quotes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Could not send dispatch request.");
      setSuccess(true);
      setQuoteCompany("");
      setQuoteName("");
      setQuotePhone("");
      setQuoteEmail("");
      setQuoteMessage("");
      setTimeout(() => setSuccess(false), 6000);
    } catch (err: any) {
      setError(err?.message || "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col justify-between">
      
      {/* 1. TOP BAR */}
      <div className="bg-[#0B2545] text-white text-xs py-2 px-4 border-b border-blue-900/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-amber-300">
              {lang === "es" ? "DESPACHO RÁPIDO & TALLER EN OZONE PARK, NY" : "RAPID FIELD DISPATCH & DEPOT IN OZONE PARK, NY"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-slate-300">📍 97-20 102nd St, Ozone Park, Queens NY 11416</span>
            <a href="tel:+17184042038" className="font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5">
              <Phone className="h-3 w-3" /> +1 (718) 404-2038
            </a>
          </div>
        </div>
      </div>

      {/* 2. HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="logo/logo.png" alt="Willy Fast Solutions Logo" className="h-11 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-[#0B2545] leading-none">
                WILLY FAST SOLUTIONS
              </span>
              <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase mt-1">
                Facility & Contact Center
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
            <Link href="/equipment-sales/" className="hover:text-[#0B2545] transition-colors">
              {lang === "es" ? "Venta Equipos" : "Equipment Sales"}
            </Link>
            <Link href="/contact/" className="text-[#0B2545] font-bold underline decoration-amber-500 underline-offset-8">
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
            <span className="text-[#0B2545]">Map & Hours</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0B2545] tracking-tight">
            {lang === "es" 
              ? "Ubicación del Taller, Horarios de Atención y Contacto" 
              : "Facility Map, Operating Hours & Service Dispatch"}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
            {lang === "es"
              ? "Visite nuestras instalaciones principales en Ozone Park, Queens NY o solicite asistencia técnica móvil inmediata las 24 horas."
              : "Visit our Ozone Park physical equipment depot in Queens, NY or request rapid mobile emergency dispatch directly to your warehouse."}
          </p>
        </div>
      </section>

      {/* 4. MAIN CONTENT: 2-COLUMN GRID (Map & Hours + Form) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (5 cols): Depot Information & Hours */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Facility Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#0B2545] text-amber-400 flex items-center justify-center font-bold">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0B2545]">Taller Principal Queens</h2>
                  <p className="text-xs text-slate-500">Willy Fast Solutions Corp Facility</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-700">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <MapPin className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#0B2545]">Dirección Física:</div>
                    <div>97-20 102nd St, Ozone Park, Queens NY 11416</div>
                    <div className="text-[11px] text-slate-500 mt-1">A minutos de Van Wyck Expy, Belt Pkwy y JFK Cargo</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Clock className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 w-full">
                    <div className="font-bold text-[#0B2545]">Horarios de Taller & Atención:</div>
                    <div className="flex justify-between"><span>Lunes – Viernes:</span><span className="font-semibold text-slate-900">7:00 AM – 6:00 PM</span></div>
                    <div className="flex justify-between"><span>Sábados:</span><span className="font-semibold text-slate-900">7:00 AM – 4:00 PM</span></div>
                    <div className="flex justify-between"><span>Domingos:</span><span className="font-bold text-amber-700">Guardia Móvil 24/7</span></div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Truck className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#0B2545]">Despacho Móvil de Emergencia:</div>
                    <div className="text-emerald-700 font-semibold">Disponible 24 Horas / 7 Días</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Llegada en &lt; 45 minutos a bodegas en Queens y Brooklyn</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a 
                  href="https://maps.google.com/?q=Willy+Fast+Solutions+Corp+97-20+102nd+St+Ozone+Park+NY+11416"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center py-3 rounded-lg bg-[#0B2545] text-white font-bold text-xs hover:bg-[#133b68] gap-2 shadow-xs"
                >
                  <MapPin className="h-4 w-4 text-amber-400" />
                  <span>{lang === "es" ? "Abrir en Google Maps" : "Open in Google Maps"}</span>
                  <ExternalLink className="h-3.5 w-3.5 ml-1 text-slate-300" />
                </a>

                <a 
                  href="https://wa.me/17184042038?text=Hello%20WillyFastSolutions,%20I%20need%20service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold text-xs hover:bg-emerald-100 gap-2"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span>WhatsApp: +1 (718) 404-2038</span>
                </a>
              </div>
            </div>

            {/* Quick Contact Info */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-xs space-y-2 text-slate-600">
              <div className="font-bold text-[#0B2545] text-sm">Contacto Directo de Oficina</div>
              <div>Teléfono: <a href="tel:+17184042038" className="font-bold text-[#0B2545] hover:underline">+1 (718) 404-2038</a></div>
              <div>Email: <a href="mailto:info@willyfastsolutions.com" className="font-bold text-[#0B2545] hover:underline">info@willyfastsolutions.com</a></div>
              <div>Idioma: Atención en Inglés y Español</div>
            </div>

          </div>

          {/* Right Column (7 cols): Service Request Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-md space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <Clock className="h-3.5 w-3.5" />
                <span>Ticket de Despacho Rápido</span>
              </div>
              <h2 className="text-2xl font-black text-[#0B2545]">
                {lang === "es" ? "Solicitar Asistencia o Cotización" : "Request Rapid Service Dispatch or Quote"}
              </h2>
              <p className="text-xs text-slate-600">
                {lang === "es" 
                  ? "Nuestro equipo de coordinación técnica le responderá en menos de 15 minutos." 
                  : "Our technical coordination dispatch team will respond in under 15 minutes."}
              </p>
            </div>

            {success && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>¡Solicitud recibida con éxito! Nuestro despachador le llamará en breve.</span>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Empresa / Almacén</label>
                  <input 
                    type="text" 
                    required 
                    value={quoteCompany}
                    onChange={(e) => setQuoteCompany(e.target.value)}
                    placeholder="e.g. Queens Freight LLC"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nombre de Contacto</label>
                  <input 
                    type="text" 
                    required 
                    value={quoteName}
                    onChange={(e) => setQuoteName(e.target.value)}
                    placeholder="e.g. John Doe / Carlos M."
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Teléfono Directo</label>
                  <input 
                    type="tel" 
                    required 
                    value={quotePhone}
                    onChange={(e) => setQuotePhone(e.target.value)}
                    placeholder="+1 (718) 000-0000"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Correo Electrónico</label>
                  <input 
                    type="email" 
                    required 
                    value={quoteEmail}
                    onChange={(e) => setQuoteEmail(e.target.value)}
                    placeholder="operations@company.com"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Servicio Requerido</label>
                  <select 
                    value={quoteServiceType}
                    onChange={(e) => setQuoteServiceType(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]"
                  >
                    <option value="Forklift Repair">Reparación de Montacargas (Mecánica/Eléctrica)</option>
                    <option value="Hydraulic Hoses">Prensado Móvil de Mangueras (6,000 PSI)</option>
                    <option value="Pallet Jack Service">Pallet Jacks (Venta / Reparación)</option>
                    <option value="Forklift Tires">Llantas de Montacargas & Prensa Móvil</option>
                    <option value="Equipment Purchase">Compra / Alquiler de Montacargas</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Urgencia</label>
                  <select 
                    value={quoteUrgency}
                    onChange={(e) => setQuoteUrgency(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]"
                  >
                    <option value="Immediate Dispatch (Emergency)">🚨 Emergencia Inmediata (Máquina Parada)</option>
                    <option value="Same Day Service">Mismo Día (Hoy)</option>
                    <option value="Next 24-48 Hours">Próximas 24-48 Horas</option>
                    <option value="Quote / Scheduled PM">Cotización / Mantenimiento Programado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Detalles de la Falla o Equipo</label>
                <textarea 
                  rows={3}
                  value={quoteMessage}
                  onChange={(e) => setQuoteMessage(e.target.value)}
                  placeholder="Indique marca, modelo y falla del equipo..."
                  className="w-full p-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 inline-flex items-center justify-center rounded-lg bg-[#0B2545] text-white font-bold text-sm hover:bg-[#133b68] disabled:opacity-50 transition-colors shadow-sm gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 text-amber-400" />
                    <span>Enviar Solicitud de Despacho</span>
                  </>
                )}
              </button>
            </form>
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
