"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wrench, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Star, 
  MessageCircle, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ArrowUpRight,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Layers,
  Settings,
  Flame,
  Award,
  CircleDot,
  FileText,
  Mail,
  Send,
  Loader2,
  Calendar,
  Building2,
  Cpu,
  Search,
  ExternalLink,
  Zap,
  Package,
  RotateCw
} from "lucide-react";

interface ReviewItem {
  id?: string;
  author_name: string;
  company_name?: string | null;
  rating: number;
  comment: string;
  service_type: string;
  location?: string | null;
  created_at?: string;
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    author_name: "Carlos Mendez",
    company_name: "Queens Logistics Depot",
    rating: 5,
    comment: "Excelente servicio de emergencia. Se nos reventó una manguera hidráulica en un forklift Toyota en plena faena y Willy llegó en menos de 40 minutos a prensar la manguera nueva. Cero tiempo muerto y 100% recomendado en Queens.",
    service_type: "Emergency Hydraulic Hose & Forklift Repair",
    location: "Ozone Park / Queens, NY"
  },
  {
    id: "rev-2",
    author_name: "Robert Kowalski",
    company_name: "Kowalski Steel & Construction",
    rating: 5,
    comment: "Best forklift field service team in New York. They handle routine PM checks and heavy mechanical repairs for our 4 Bobcat skid steers and Caterpillar machines. Honest pricing and fast turnaround.",
    service_type: "Preventive Maintenance & Safety Service",
    location: "Long Island City, NY"
  },
  {
    id: "rev-3",
    author_name: "David Rodriguez",
    company_name: "DR Warehouse Solutions",
    rating: 5,
    comment: "Compramos un montacargas Toyota certificado con Willy Fast Solutions y el equipo vino impecable, con garantía y listo para trabajar. Gran honestidad y profesionalismo.",
    service_type: "Machinery Sales & Certification",
    location: "Brooklyn / Queens, NY"
  },
  {
    id: "rev-4",
    author_name: "Michael Chang",
    company_name: "Metro Freight Cargo",
    rating: 5,
    comment: "Top notch mobile hydraulic repair. Fabricated high-pressure spiral hoses directly on-site at our depot in Queens. Fast turnaround, quality crimping and fair pricing.",
    service_type: "Hydraulic Hoses & Fittings",
    location: "Jamaica, Queens, NY"
  },
  {
    id: "rev-5",
    author_name: "Luis Morales",
    company_name: "Morales Demolition & Excavation",
    rating: 5,
    comment: "Muy buen mecánico de montacargas y maquinaria pesada en Nueva York. Nos resolvió una fuga hidráulica y calibró el mástil en tiempo récord directamente en nuestra bodega.",
    service_type: "Forklift Repair & Diagnostics",
    location: "Queens, NY"
  },
  {
    id: "rev-6",
    author_name: "Antonio Silveira",
    company_name: "Silveira Transport LLC",
    rating: 5,
    comment: "5 stars all the way. Reliable, prompt, and knowledgeable mechanics. Their mobile tire pressing service saved us days of waiting for dealer service.",
    service_type: "Forklift Tires & Mobile Pressing",
    location: "Ozone Park, NY"
  }
];

export default function CorporateHomePage() {
  const [lang, setLang] = useState<"en" | "es">("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quote Form State
  const [quoteCompany, setQuoteCompany] = useState("");
  const [quoteName, setQuoteName] = useState("");
  const [quotePhone, setQuotePhone] = useState("");
  const [quoteEmail, setQuoteEmail] = useState("");
  const [quoteServiceType, setQuoteServiceType] = useState("Forklift Repair");
  const [quoteUrgency, setQuoteUrgency] = useState("Immediate Dispatch (Emergency)");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Reviews State
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newAuthor, setNewAuthor] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newService, setNewService] = useState("Forklift Repair");
  const [newLocation, setNewLocation] = useState("Queens, NY");
  const [newComment, setNewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState<string | null>(null);

  // Load reviews from API
  useEffect(() => {
    const isOffline = typeof window !== "undefined" && window.location.protocol === "file:";
    const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : "";

    if (!isOffline) {
      fetch(`${API_BASE_URL}/api/reviews/public`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && Array.isArray(data.reviews) && data.reviews.length > 0) {
            setReviews(data.reviews);
          }
        })
        .catch(err => {
          console.warn("Could not fetch public reviews, using defaults:", err);
        });
    }
  }, []);

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingQuote(true);
    setQuoteError(null);

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
        setIsSubmittingQuote(false);
        setQuoteSuccess(true);
        setTimeout(() => setQuoteSuccess(false), 6000);
      }, 1000);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsSubmittingQuote(false);
        setQuoteSuccess(true);
        setQuoteCompany("");
        setQuoteName("");
        setQuotePhone("");
        setQuoteEmail("");
        setQuoteMessage("");
        setTimeout(() => setQuoteSuccess(false), 6000);
      } else {
        const err = await res.json();
        setIsSubmittingQuote(false);
        setQuoteError(err.detail || "Error submitting request. Please call (718) 404-2038 directly.");
      }
    } catch (err) {
      console.error(err);
      setIsSubmittingQuote(false);
      setQuoteError("Network connection error. Please call +1 (718) 404-2038 directly.");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);

    const payload = {
      author_name: newAuthor.trim(),
      company_name: newCompany.trim() || undefined,
      rating: newRating,
      comment: newComment.trim(),
      service_type: newService,
      location: newLocation
    };

    const isOffline = typeof window !== "undefined" && window.location.protocol === "file:";
    const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : "";

    if (!isOffline) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/reviews/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = await res.json();
          setReviews([created, ...reviews]);
          setReviewSuccessMessage(lang === "es" ? "¡Gracias! Tu reseña ha sido registrada exitosamente." : "Thank you! Your verified review has been submitted.");
          setTimeout(() => {
            setReviewModalOpen(false);
            setReviewSuccessMessage(null);
            setNewAuthor("");
            setNewCompany("");
            setNewComment("");
          }, 2000);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setReviews([{ ...payload, id: `rev-${Date.now()}` }, ...reviews]);
      setReviewSuccessMessage("Thank you! Review saved locally.");
      setTimeout(() => {
        setReviewModalOpen(false);
        setReviewSuccessMessage(null);
      }, 2000);
    }
    setIsSubmittingReview(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* 1. TOP EMERGENCY RAPID DISPATCH BANNER (Deep Navy + Safety Amber) */}
      <div className="bg-[#0B2545] text-white border-b border-blue-900/60 text-xs py-2 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-amber-300">
              {lang === "es" ? "DESPACHO MÓVIL 24/7 EN NUEVA YORK:" : "24/7 RAPID MOBILE FIELD SERVICE:"}
            </span>
            <span className="text-slate-200">
              {lang === "es" 
                ? "Taller móvil con prensa de mangueras hidráulicas y mecánicos en sitio en <45 min." 
                : "On-site forklift mechanics & mobile hydraulic hose press in <45 min."}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-slate-200">
            <span className="hidden md:inline text-slate-400">📍 97-20 102nd St, Ozone Park, Queens NY</span>
            <a 
              href="tel:+17184042038" 
              className="font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded border border-white/15"
            >
              <Phone className="h-3 w-3" /> +1 (718) 404-2038
            </a>
          </div>
        </div>
      </div>

      {/* 2. CORPORATE HEADER / NAVBAR (Clean White & Slate) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Corporate Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="logo/logo.png" 
              alt="Willy Fast Solutions Corp Logo" 
              className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-[#0B2545] leading-none">
                WILLY FAST SOLUTIONS
              </span>
              <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase mt-1">
                Corp • Commercial Lift Trucks & Heavy Equipment
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <a href="#services" className="hover:text-[#0B2545] transition-colors">
              {lang === "es" ? "Servicios" : "Services"}
            </a>
            <a href="#hydraulic-hoses" className="hover:text-[#0B2545] transition-colors">
              {lang === "es" ? "Mangueras 6,000 PSI" : "Hydraulic Hoses"}
            </a>
            <a href="#pallet-jacks" className="hover:text-[#0B2545] transition-colors">
              {lang === "es" ? "Pallet Jacks" : "Pallet Jacks"}
            </a>
            <a href="#tires-pressing" className="hover:text-[#0B2545] transition-colors">
              {lang === "es" ? "Llantas & Prensa" : "Tires & Pressing"}
            </a>
            <a href="#equipment-sales" className="hover:text-[#0B2545] transition-colors">
              {lang === "es" ? "Venta de Equipos" : "Equipment Sales"}
            </a>
            <a href="#reviews" className="hover:text-[#0B2545] transition-colors flex items-center gap-1">
              <span>{lang === "es" ? "Reseñas" : "Reviews"}</span>
              <span className="text-amber-500 font-bold text-xs">★ 5.0</span>
            </a>
            <a href="#contact" className="hover:text-[#0B2545] transition-colors">
              {lang === "es" ? "Contacto" : "Contact"}
            </a>
          </nav>

          {/* Right Header CTAs & Software Portal Button */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Dedicated SaaS software division link (Clearly separated) */}
            <a 
              href="software/"
              onClick={(e) => {
                if (typeof window !== "undefined" && window.location.protocol === "file:") {
                  e.preventDefault();
                  window.location.href = "software/index.html";
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 text-[#0B2545] text-xs font-bold hover:bg-blue-100 hover:border-blue-300 transition-all shadow-sm"
              title="Looking for our Fleet Telemetry and OSHA Software Division?"
            >
              <Cpu className="h-3.5 w-3.5 text-blue-700" />
              <span>{lang === "es" ? "Software Telemetría" : "Fleet Software"}</span>
            </a>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === "en" ? "es" : "en")}
              className="inline-flex items-center px-2.5 py-1 rounded border border-slate-300 bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              {lang === "en" ? "🇺🇸 EN" : "🇪🇸 ES"}
            </button>

            {/* Direct Call Button (Safety Amber) */}
            <a 
              href="tel:+17184042038"
              className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-sm gap-2"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>(718) 404-2038</span>
            </a>

            {/* Client Portal Login */}
            <a 
              href="login/"
              onClick={(e) => {
                if (typeof window !== "undefined" && window.location.protocol === "file:") {
                  e.preventDefault();
                  window.location.href = "login/index.html";
                }
              }}
              className="inline-flex items-center justify-center h-10 px-3 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
            >
              {lang === "es" ? "Acceso Clientes" : "Client Login"}
            </a>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
            aria-label="Toggle mobile menu"
          >
            <Layers className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 text-sm font-semibold">
            <a 
              href="#services" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 hover:text-[#0B2545]"
            >
              {lang === "es" ? "Servicios Principales" : "Commercial Services"}
            </a>
            <a 
              href="#hydraulic-hoses" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 hover:text-[#0B2545]"
            >
              {lang === "es" ? "Mangueras Hidráulicas 6,000 PSI" : "Hydraulic Hoses (6,000 PSI)"}
            </a>
            <a 
              href="#pallet-jacks" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 hover:text-[#0B2545]"
            >
              {lang === "es" ? "Pallet Jacks (Venta & Taller)" : "Pallet Jacks (Sales & Service)"}
            </a>
            <a 
              href="#tires-pressing" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 hover:text-[#0B2545]"
            >
              {lang === "es" ? "Llantas & Prensa Móvil" : "Forklift Tires & Mobile Pressing"}
            </a>
            <a 
              href="#equipment-sales" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 hover:text-[#0B2545]"
            >
              {lang === "es" ? "Venta de Montacargas" : "Equipment Sales"}
            </a>
            <a 
              href="#reviews" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 hover:text-[#0B2545]"
            >
              {lang === "es" ? "Reseñas Verificadas (★ 5.0)" : "Verified Reviews (★ 5.0)"}
            </a>
            
            <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
              <a 
                href="software/"
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-50 text-[#0B2545] font-bold border border-blue-200"
              >
                <Cpu className="h-4 w-4 text-blue-700" />
                <span>{lang === "es" ? "División Software Telemetría" : "Fleet Telemetry Software Division"}</span>
              </a>
              <a 
                href="tel:+17184042038"
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-500 text-slate-950 font-bold"
              >
                <Phone className="h-4 w-4" />
                <span>{lang === "es" ? "Llamar Taller: (718) 404-2038" : "Call Dispatch: (718) 404-2038"}</span>
              </a>
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setLang(lang === "en" ? "es" : "en")}
                  className="px-3 py-1.5 rounded border border-slate-300 bg-slate-100 font-bold text-xs text-slate-700"
                >
                  {lang === "en" ? "Cambiar a Español" : "Switch to English"}
                </button>
                <a 
                  href="login/"
                  className="text-xs text-slate-600 font-semibold underline"
                >
                  {lang === "es" ? "Portal Clientes" : "Client Portal"}
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION (Classic Corporate Heavy Equipment B2B) */}
      <section className="relative bg-gradient-to-b from-white via-slate-50 to-blue-50/30 border-b border-slate-200 py-12 md:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Column: Value Proposition & Direct Dispatch */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0B2545] text-xs font-bold">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {lang === "es" 
                    ? "Taller Industrial Especializado • Ozone Park, Queens NY" 
                    : "Commercial Forklift & Industrial Hydraulic Specialists • Metro NYC"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B2545] tracking-tight leading-[1.15]">
                {lang === "es" ? (
                  <>
                    Servicio Mecánico de Montacargas, Mangueras Hidráulicas y Maquinaria Pesada en Nueva York
                  </>
                ) : (
                  <>
                    Commercial Forklift Repair, Mobile Hydraulic Hoses & Heavy Machinery in New York
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                {lang === "es" ? (
                  <>
                    Servicio móvil en sitio las 24 horas. Prensado de mangueras hidráulicas de alta presión hasta 6,000 PSI, reparación y venta de pallet jacks manuales y eléctricos, prensa móvil para llantas sólidas y mantenimiento de retroexcavadoras. Llegamos a su bodega u obra en menos de 45 minutos.
                  </>
                ) : (
                  <>
                    Rapid-response on-site field service 24/7. Mobile hydraulic hose replacement crimped up to 6,000 PSI, manual & electric pallet jack repair and sales, on-site solid tire pressing, and heavy excavator maintenance. Dispatched directly from Ozone Park, Queens across all 5 boroughs.
                  </>
                )}
              </p>

              {/* Direct Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a 
                  href="tel:+17184042038"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-amber-500 text-slate-950 font-black text-sm hover:bg-amber-400 transition-all shadow-md hover:shadow-lg gap-2"
                >
                  <Phone className="h-4 w-4" />
                  <span>{lang === "es" ? "Llamar Despacho 24/7: (718) 404-2038" : "24/7 Rapid Dispatch: (718) 404-2038"}</span>
                </a>

                <a 
                  href="#contact"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-[#0B2545] text-white font-bold text-sm hover:bg-[#133b68] transition-all shadow-sm gap-2"
                >
                  <Wrench className="h-4 w-4 text-amber-400" />
                  <span>{lang === "es" ? "Solicitar Cotización de Servicio" : "Request Rapid Service Quote"}</span>
                </a>

                <a 
                  href="https://wa.me/17184042038?text=Hello%20Willy%20Fast%20Solutions,%20I%20need%20forklift/hydraulic%20service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-12 px-4 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold text-sm hover:bg-emerald-100 transition-all gap-2"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Trust Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-200">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <div className="text-2xl font-black text-[#0B2545]">&lt; 45 Min</div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {lang === "es" ? "Llegada a Queens" : "Queens Arrival"}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <div className="text-2xl font-black text-[#0B2545]">6,000 PSI</div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {lang === "es" ? "Prensado Móvil" : "Mobile Hose Press"}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <div className="text-2xl font-black text-[#0B2545]">15+ Años</div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {lang === "es" ? "Experiencia Mecánica" : "Heavy Mechanical Exp"}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <div className="text-2xl font-black text-amber-600 flex items-center gap-1">
                    <span>5.0</span>
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {lang === "es" ? "48 Reseñas Google" : "48 Google Reviews"}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Hero Column: Corporate Equipment Showcase Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-amber-400" />
                    <span className="font-bold text-sm tracking-wide">
                      {lang === "es" ? "Unidad Móvil de Despacho Rápido" : "Mobile Heavy Service Dispatch"}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded uppercase">
                    Ready 24/7
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-video flex items-center justify-center">
                    <img 
                      src="images/forklift.webp" 
                      alt="Commercial Forklift Repair Toyota Queens NY" 
                      className="w-full h-full object-contain p-2"
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded border border-white/20">
                      Toyota 8FGU25 • On-Site Hydraulic Service
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span><strong>{lang === "es" ? "Camión Taller:" : "Mobile Workshop:"}</strong> {lang === "es" ? "Prensa hidráulica y stock de conexiones en sitio." : "Hydraulic crimper & high-pressure fitting inventory on board."}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span><strong>{lang === "es" ? "Marcas que reparamos:" : "Brands Serviced:"}</strong> Toyota, Crown, Hyster, Yale, Caterpillar, Clark, Raymond, Bobcat.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span><strong>{lang === "es" ? "Ubicación taller:" : "Physical Facility:"}</strong> 97-20 102nd St, Ozone Park, Queens NY 11416.</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {lang === "es" ? "¿Emergencia mecánica hoy?" : "Machinery down right now?"}
                    </span>
                    <a 
                      href="tel:+17184042038"
                      className="font-black text-[#0B2545] hover:text-blue-700 transition-colors flex items-center gap-1"
                    >
                      Call Direct →
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. THE 4 COMMERCIAL SERVICE PILLARS (Modeled after CLT Lift Trucks) */}
      <section id="services" className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              <Award className="h-3.5 w-3.5" />
              <span>{lang === "es" ? "Especialistas Mecánicos en Nueva York" : "Core Commercial Capabilities"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0B2545] tracking-tight">
              {lang === "es" 
                ? "Nuestros 4 Pilares de Servicio Técnico y Taller Físico" 
                : "4 Core Heavy Machinery & Forklift Service Pillars"}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {lang === "es"
                ? "Desde reparaciones de emergencia en menos de 45 minutos hasta contratos de mantenimiento preventivo y venta de equipos certificados con garantía."
                : "From emergency on-site field repairs in under 45 minutes to mobile hose crimping and certified equipment sales backed by full warranties."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* PILLAR 1: Field Service 24/7 */}
            <div id="field-service" className="bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-400 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-[#0B2545] text-amber-400 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform shadow-sm">
                  <Wrench className="h-6 w-6" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  {lang === "es" ? "Pilar 1 • Mecánica Móvil 24/7" : "Pillar 1 • 24/7 Field Service"}
                </div>
                <h3 className="text-xl font-bold text-[#0B2545] leading-tight">
                  {lang === "es" ? "Reparación Mecánica en Sitio" : "Emergency On-Site Field Repairs"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang === "es"
                    ? "Diagnóstico y reparación completa de mástiles, cilindros, frenos, transmisiones, motores a gas/diésel y sistemas eléctricos para Toyota, Crown, Hyster, Yale y Cat."
                    : "Full mast overhaul, hydraulic cylinder repacking, brakes, starters, engines, and electrical diagnostics on Toyota, Crown, Hyster, Yale, and Cat lift trucks."}
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-200">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{lang === "es" ? "Despacho a bodega < 45 min" : "< 45 min warehouse arrival"}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{lang === "es" ? "Calibración de válvulas y mástil" : "Mast & valve recalibration"}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{lang === "es" ? "Mecánicos certificados en NYC" : "Fully certified NY mechanics"}</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <a 
                  href="tel:+17184042038"
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-lg bg-[#0B2545] text-white font-bold text-xs hover:bg-[#133b68] transition-colors gap-1.5"
                >
                  <Phone className="h-3.5 w-3.5 text-amber-400" />
                  <span>{lang === "es" ? "Solicitar Mecánico" : "Dispatch Mechanic"}</span>
                </a>
              </div>
            </div>

            {/* PILLAR 2: Hydraulic Hoses 6,000 PSI */}
            <div id="hydraulic-hoses" className="bg-slate-50 rounded-2xl border border-slate-200 hover:border-amber-400 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform shadow-sm">
                  <Flame className="h-6 w-6" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  {lang === "es" ? "Pilar 2 • Prensado en Sitio" : "Pillar 2 • Mobile Crimping"}
                </div>
                <h3 className="text-xl font-bold text-[#0B2545] leading-tight">
                  {lang === "es" ? "Mangueras Hidráulicas 6,000 PSI" : "High-Pressure Hydraulic Hoses"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang === "es"
                    ? "Fabricación y prensado móvil directo en su bodega u obra. Mangueras de 2, 4 y 6 espirales hasta 6,000 PSI con acoples JIC, ORFS, DIN, BSP y bridas split Code 61/62."
                    : "Custom on-site hydraulic hose fabrication. 2-wire, 4-spiral & 6-spiral hoses up to 6,000 PSI with JIC, ORFS, DIN, BSP fittings and split flange connections."}
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-200">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{lang === "es" ? "Prensa móvil en camión taller" : "On-board van hydraulic press"}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{lang === "es" ? "Solución a fugas en tiempo récord" : "Instant fluid leak elimination"}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{lang === "es" ? "Para montacargas y retroexcavadoras" : "For forklifts & excavators"}</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <a 
                  href="tel:+17184042038"
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors gap-1.5 shadow-xs"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>{lang === "es" ? "Prensado Urgente" : "Call Hose Press"}</span>
                </a>
              </div>
            </div>

            {/* PILLAR 3: Pallet Jacks (Sales & Repairs) */}
            <div id="pallet-jacks" className="bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-400 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-[#0B2545] text-amber-400 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform shadow-sm">
                  <Package className="h-6 w-6" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  {lang === "es" ? "Pilar 3 • Venta & Reparación" : "Pillar 3 • Sales & Service"}
                </div>
                <h3 className="text-xl font-bold text-[#0B2545] leading-tight">
                  {lang === "es" ? "Pallet Jacks Manuales & Eléctricos" : "Pallet Jack Sales & Pump Rebuilds"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang === "es"
                    ? "Venta y reparación de transpaletas manuales de 5,500 lbs y eléctricas tipo walkie. Reconstrucción de bombas hidráulicas, cambio de ruedas de poliuretano y garantía."
                    : "Manual hand pallet jacks (5,500 lbs) and electric walkies. Hydraulic pump overhauls, polyurethane floor-protective wheel replacements, and warranty units."}
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-200">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{lang === "es" ? "Equipos nuevos y reacondicionados" : "New & certified rebuilt units"}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{lang === "es" ? "Ruedas de uretano y nylon" : "Polyurethane & nylon rollers"}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{lang === "es" ? "Empaques y retenedores de bomba" : "Pump seal kit repacking"}</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <a 
                  href="#contact"
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-lg bg-[#0B2545] text-white font-bold text-xs hover:bg-[#133b68] transition-colors gap-1.5"
                >
                  <Package className="h-3.5 w-3.5 text-amber-400" />
                  <span>{lang === "es" ? "Cotizar Pallet Jack" : "Quote Pallet Jack"}</span>
                </a>
              </div>
            </div>

            {/* PILLAR 4: Forklift Tires & Mobile Pressing */}
            <div id="tires-pressing" className="bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-400 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-[#0B2545] text-amber-400 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform shadow-sm">
                  <RotateCw className="h-6 w-6" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  {lang === "es" ? "Pilar 4 • Prensa Móvil" : "Pillar 4 • Mobile Tire Pressing"}
                </div>
                <h3 className="text-xl font-bold text-[#0B2545] leading-tight">
                  {lang === "es" ? "Llantas Sólidas & Prensa Móvil" : "Forklift Tires & Mobile Pressing"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang === "es"
                    ? "Llantas sólidas cushion y neumáticas prensadas directamente en su almacén con nuestro camión prensa móvil. Compuestos non-marking que no rayan el piso."
                    : "Smooth cushion, traction, and solid pneumatic forklift tires pressed on-site with our mobile hydraulic tire press truck. Non-marking compounds available."}
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-200">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{lang === "es" ? "Prensado in-situ sin retirar ruedas" : "On-site pressing at your dock"}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{lang === "es" ? "Llantas que no marcan el suelo" : "Non-marking clean compounds"}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{lang === "es" ? "Elimina tiempo muerto de envío" : "Zero off-site freight downtime"}</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <a 
                  href="tel:+17184042038"
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-lg bg-[#0B2545] text-white font-bold text-xs hover:bg-[#133b68] transition-colors gap-1.5"
                >
                  <Phone className="h-3.5 w-3.5 text-amber-400" />
                  <span>{lang === "es" ? "Pedir Cambio Llantas" : "Schedule Tire Press"}</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. HEAVY MACHINERY & EXCAVATOR DIVISION (Bobcat, Cat, Case) */}
      <section className="py-16 bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold uppercase tracking-wider">
                  <Truck className="h-3.5 w-3.5" />
                  <span>{lang === "es" ? "División de Maquinaria Pesada & Construcción" : "Heavy Machinery & Construction Division"}</span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-black text-[#0B2545]">
                  {lang === "es" 
                    ? "Servicio Técnico de Retroexcavadoras y Skid Steers en Obra" 
                    : "Backhoe, Skid Steer & Excavator Field Maintenance"}
                </h3>
                
                <p className="text-sm text-slate-600 leading-relaxed">
                  {lang === "es"
                    ? "Contamos con mecánicos diésel de servicio pesado equipados para atender minicargadores Bobcat, retroexcavadoras Caterpillar, Case y John Deere. Reparación de orugas, pistones de pala, bombas hidráulicas y mantenimiento periódico directamente en su obra o depósito en Nueva York."
                    : "Our heavy diesel mobile service vans are equipped to handle Bobcat skid steers, Caterpillar, Case, and John Deere excavators and backhoes on-site. Track maintenance, bucket hydraulic cylinder repairs, and scheduled PM at your jobsite across Metro NY."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Bobcat S76 / T76 Skid Steer Specialists</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Caterpillar & Case Backhoe Hydraulics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{lang === "es" ? "Reparación de cilindros y fugas" : "Cylinder repacking & leak repairs"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{lang === "es" ? "Servicio a domicilio en NYC Tri-State" : "On-site dispatch across NY Tri-State"}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                  <img 
                    src="images/skid_steer.webp" 
                    alt="Bobcat Skid Steer Repair Queens NY" 
                    className="h-28 w-auto mx-auto object-contain mb-2"
                  />
                  <span className="text-xs font-bold text-[#0B2545]">Bobcat Skid Steers</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                  <img 
                    src="images/excavator.webp" 
                    alt="Caterpillar Excavator Hydraulic Service NY" 
                    className="h-28 w-auto mx-auto object-contain mb-2"
                  />
                  <span className="text-xs font-bold text-[#0B2545]">Cat & Case Excavators</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 6. CERTIFIED EQUIPMENT SALES SHOWCASE */}
      <section id="equipment-sales" className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                {lang === "es" ? "Inventario Listo Para Trabajar" : "Inspected & Certified Inventory"}
              </div>
              <h2 className="text-3xl font-black text-[#0B2545] tracking-tight mt-1">
                {lang === "es" ? "Venta de Montacargas Certificados" : "Certified Pre-Owned Forklifts for Sale"}
              </h2>
            </div>
            <a 
              href="#contact" 
              className="text-xs font-bold text-[#0B2545] hover:text-blue-700 flex items-center gap-1"
            >
              <span>{lang === "es" ? "Consultar Inventario Completo" : "Inquire Available Inventory"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Equipment Card 1 */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
              <div className="bg-white p-6 border-b border-slate-200 flex items-center justify-center h-48">
                <img 
                  src="images/forklift.webp" 
                  alt="Toyota 8FGU25 Forklift For Sale" 
                  className="max-h-full object-contain"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-[#0B2545]">Toyota 8FGU25</h3>
                    <p className="text-xs text-slate-500">5,000 lbs • LP Gas • Triple Mast 189"</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Ready
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {lang === "es" 
                    ? "Inspeccionado al 100%, cilindros hidráulicos repacados, llantas sólidas nuevas y garantía de tren motriz." 
                    : "100% inspection verified, repacked hydraulic cylinders, new solid cushion tires, powertrain warranty."}
                </p>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">WFS Certified</span>
                  <a 
                    href="#contact" 
                    className="text-xs font-bold text-[#0B2545] hover:underline"
                  >
                    {lang === "es" ? "Pedir Cotización →" : "Request Pricing →"}
                  </a>
                </div>
              </div>
            </div>

            {/* Equipment Card 2 */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
              <div className="bg-white p-6 border-b border-slate-200 flex items-center justify-center h-48">
                <img 
                  src="images/forklift.webp" 
                  alt="Crown Electric Forklift For Sale" 
                  className="max-h-full object-contain grayscale-30"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-[#0B2545]">Crown SC 5200 Electric</h3>
                    <p className="text-xs text-slate-500">4,000 lbs • 36V Electric • Non-Marking Tires</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Certified
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {lang === "es" 
                    ? "Ideal para almacenes cerrados, cargador incluido, batería regenerada con prueba de descarga certificada." 
                    : "Zero emissions for food & pharmaceutical depots. Includes industrial charger and load-tested battery."}
                </p>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">WFS Certified</span>
                  <a 
                    href="#contact" 
                    className="text-xs font-bold text-[#0B2545] hover:underline"
                  >
                    {lang === "es" ? "Pedir Cotización →" : "Request Pricing →"}
                  </a>
                </div>
              </div>
            </div>

            {/* Equipment Card 3 */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
              <div className="bg-white p-6 border-b border-slate-200 flex items-center justify-center h-48">
                <img 
                  src="images/forklift.webp" 
                  alt="Hyster Pneumatic Forklift Queens" 
                  className="max-h-full object-contain hue-rotate-15"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-[#0B2545]">Hyster H50FT Heavy Duty</h3>
                    <p className="text-xs text-slate-500">5,000 lbs • Dual Fuel • Solid Pneumatic</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Ready
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {lang === "es" 
                    ? "Diseñado para patios exteriores y aserraderos. Llantas sólidas para grava, frenos de disco en aceite." 
                    : "Built for rugged lumber & masonry yards. Solid pneumatic tires, wet disc brakes, heavy-duty mast."}
                </p>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">WFS Certified</span>
                  <a 
                    href="#contact" 
                    className="text-xs font-bold text-[#0B2545] hover:underline"
                  >
                    {lang === "es" ? "Pedir Cotización →" : "Request Pricing →"}
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. DISTINCT CORPORATE CALLOUT: SEPARATE FLEET SOFTWARE DIVISION */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50/70 via-slate-50 to-indigo-50/50 p-8 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B2545] bg-blue-100/80 px-2.5 py-1 rounded">
                <Cpu className="h-3.5 w-3.5 text-blue-700" />
                <span>{lang === "es" ? "División Digital Independiente" : "Dedicated Digital Fleet Division"}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#0B2545]">
                {lang === "es" 
                  ? "¿Administra una flota corporativa y necesita software de telemetría?" 
                  : "Managing a corporate warehouse fleet & need telemetry software?"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {lang === "es"
                  ? "Willy Fast Solutions también cuenta con una plataforma SaaS dedicada para monitoreo autónomo de horómetros, alertas predictivas de mantenimiento, cálculo de ROI de tiempo muerto y listas digitales de inspección diaria OSHA."
                  : "Willy Fast Solutions operates an isolated SaaS telemetry suite for autonomous horometer tracking, daemon predictive maintenance alerts, fleet downtime ROI calculation, and digital OSHA pre-shift inspection checklists."}
              </p>
            </div>

            <a 
              href="software/"
              onClick={(e) => {
                if (typeof window !== "undefined" && window.location.protocol === "file:") {
                  e.preventDefault();
                  window.location.href = "software/index.html";
                }
              }}
              className="inline-flex items-center justify-center whitespace-nowrap h-12 px-6 rounded-lg bg-[#0B2545] text-white font-bold text-xs hover:bg-[#133b68] transition-colors shadow-sm gap-2"
            >
              <span>{lang === "es" ? "Explorar División Software →" : "Visit Fleet Software Portal →"}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 8. COMMERCIAL INTERACTIVE QUOTE & SERVICE DISPATCH FORM */}
      <section id="contact" className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-md space-y-8">
            
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <Clock className="h-3.5 w-3.5" />
                <span>{lang === "es" ? "Respuesta Inmediata" : "Rapid Turnaround"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B2545]">
                {lang === "es" ? "Solicitud de Servicio o Cotización Comercial" : "Commercial Service Request & Quote"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {lang === "es" 
                  ? "Complete el formulario para despacho rápido de mecánicos o cotización formal de equipos." 
                  : "Submit below for rapid mechanic dispatch or official quotation. For immediate breakdown, call (718) 404-2038."}
              </p>
            </div>

            {quoteSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>
                  {lang === "es" 
                    ? "¡Solicitud recibida! Nuestro despachador le contactará en menos de 15 minutos." 
                    : "Service request received! Our dispatch team will contact you within 15 minutes."}
                </span>
              </div>
            )}

            {quoteError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold text-center">
                {quoteError}
              </div>
            )}

            <form onSubmit={handleQuoteSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {lang === "es" ? "Nombre de la Empresa / Almacén" : "Company / Warehouse Name"}
                  </label>
                  <input 
                    type="text" 
                    required
                    value={quoteCompany}
                    onChange={(e) => setQuoteCompany(e.target.value)}
                    placeholder="e.g. Metro Freight Corp"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#0B2545] focus:ring-1 focus:ring-[#0B2545]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {lang === "es" ? "Nombre del Contacto" : "Contact Name"}
                  </label>
                  <input 
                    type="text" 
                    required
                    value={quoteName}
                    onChange={(e) => setQuoteName(e.target.value)}
                    placeholder="e.g. John Doe / Carlos M."
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#0B2545] focus:ring-1 focus:ring-[#0B2545]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {lang === "es" ? "Teléfono de Contacto (Directo)" : "Direct Phone Number"}
                  </label>
                  <input 
                    type="tel" 
                    required
                    value={quotePhone}
                    onChange={(e) => setQuotePhone(e.target.value)}
                    placeholder="+1 (718) 000-0000"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#0B2545] focus:ring-1 focus:ring-[#0B2545]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {lang === "es" ? "Correo Electrónico Corporativo" : "Corporate Email"}
                  </label>
                  <input 
                    type="email" 
                    required
                    value={quoteEmail}
                    onChange={(e) => setQuoteEmail(e.target.value)}
                    placeholder="operations@company.com"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#0B2545] focus:ring-1 focus:ring-[#0B2545]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {lang === "es" ? "Tipo de Servicio Requerido" : "Service Category"}
                  </label>
                  <select 
                    value={quoteServiceType}
                    onChange={(e) => setQuoteServiceType(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#0B2545]"
                  >
                    <option value="Forklift Repair">Forklift Repair (Mechanical/Electrical)</option>
                    <option value="Hydraulic Hoses">Mobile Hydraulic Hose Replacement (6,000 PSI)</option>
                    <option value="Pallet Jack Service">Pallet Jack Repair / Purchase</option>
                    <option value="Forklift Tires">Forklift Tires & Mobile Pressing</option>
                    <option value="Heavy Equipment">Heavy Machinery / Backhoe Service</option>
                    <option value="Equipment Purchase">Certified Equipment Purchase Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {lang === "es" ? "Nivel de Urgencia" : "Urgency Level"}
                  </label>
                  <select 
                    value={quoteUrgency}
                    onChange={(e) => setQuoteUrgency(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#0B2545]"
                  >
                    <option value="Immediate Dispatch (Emergency)">🚨 Emergency - Machine Down (Immediate Dispatch)</option>
                    <option value="Same Day Service">Same Day Service</option>
                    <option value="Next 24-48 Hours">Next 24-48 Hours</option>
                    <option value="Quote / Scheduled PM">Quote / Routine Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {lang === "es" ? "Detalles de la Máquina o Síntomas" : "Equipment Details / Symptoms"}
                </label>
                <textarea 
                  rows={3}
                  value={quoteMessage}
                  onChange={(e) => setQuoteMessage(e.target.value)}
                  placeholder={lang === "es" 
                    ? "Indique marca, modelo y falla (ej: Toyota 8FGU25 con fuga de aceite hidráulico en el mástil)..." 
                    : "Specify machine brand, model and issue (e.g. Toyota 8FGU25 leaking hydraulic fluid at mast)..."}
                  className="w-full p-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#0B2545] focus:ring-1 focus:ring-[#0B2545] resize-none"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingQuote}
                  className="flex-1 h-12 inline-flex items-center justify-center rounded-lg bg-[#0B2545] text-white font-bold text-sm hover:bg-[#133b68] disabled:opacity-50 transition-colors shadow-sm gap-2 cursor-pointer"
                >
                  {isSubmittingQuote ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{lang === "es" ? "Enviando Solicitud..." : "Submitting Dispatch Request..."}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 text-amber-400" />
                      <span>{lang === "es" ? "Enviar Solicitud de Servicio" : "Submit Service Request"}</span>
                    </>
                  )}
                </button>

                <a 
                  href={`https://wa.me/17184042038?text=Hello%20WillyFastSolutions,%20I%20need%20${encodeURIComponent(quoteServiceType)}%20for%20company%20${encodeURIComponent(quoteCompany || "Client")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 px-5 inline-flex items-center justify-center rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold text-sm hover:bg-emerald-100 transition-colors gap-2"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span>{lang === "es" ? "WhatsApp Directo" : "Direct WhatsApp"}</span>
                </a>
              </div>

            </form>
          </div>
        </div>
      </section>

      {/* 9. VERIFIED GOOGLE COMMERCIAL REVIEWS (48 Reviews • 5.0 Stars) */}
      <section id="reviews" className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                <Star className="h-4 w-4 fill-amber-500" />
                <Star className="h-4 w-4 fill-amber-500" />
                <Star className="h-4 w-4 fill-amber-500" />
                <Star className="h-4 w-4 fill-amber-500" />
                <Star className="h-4 w-4 fill-amber-500" />
                <span className="text-xs font-bold text-slate-700 ml-1">5.0 Star Rated on Google (48 Reviews)</span>
              </div>
              <h2 className="text-3xl font-black text-[#0B2545] tracking-tight">
                {lang === "es" ? "Opiniones de Clientes Comerciales" : "Verified Customer Testimonials"}
              </h2>
            </div>
            
            <button
              onClick={() => setReviewModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#0B2545] text-[#0B2545] hover:bg-blue-50 font-bold text-xs transition-colors cursor-pointer"
            >
              <span>{lang === "es" ? "Dejar Reseña Verificada" : "Write a Verified Review"}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev, idx) => (
              <div 
                key={rev.id || idx}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-500">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-500" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                      Google Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <div className="font-bold text-xs text-[#0B2545]">{rev.author_name}</div>
                  {rev.company_name && (
                    <div className="text-[11px] text-slate-500 font-medium">{rev.company_name}</div>
                  )}
                  <div className="text-[10px] text-amber-700 font-semibold mt-1">
                    {rev.service_type} • {rev.location || "Queens, NY"}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 10. SERVICE COVERAGE RADIUS (Metro NY & Tri-State Area) */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2545]">
              {lang === "es" ? "Zonas de Cobertura y Despacho Rápido" : "Rapid Mobile Dispatch Coverage Zones"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {lang === "es"
                ? "Con base en Ozone Park, Queens, nuestros camiones taller cubren los 5 condados de Nueva York y Long Island."
                : "Stationed at our Ozone Park facility in Queens, our mobile service trucks cover all 5 boroughs & Long Island daily."}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="font-bold text-sm text-[#0B2545]">Queens</div>
              <div className="text-[10px] text-slate-500 mt-1">Ozone Park, Jamaica, LIC, Maspeth, JFK Cargo</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="font-bold text-sm text-[#0B2545]">Brooklyn</div>
              <div className="text-[10px] text-slate-500 mt-1">Greenpoint, Bushwick, Navy Yard, Sunset Park</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="font-bold text-sm text-[#0B2545]">Long Island</div>
              <div className="text-[10px] text-slate-500 mt-1">Nassau County, Suffolk, Hicksville, Elmont</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="font-bold text-sm text-[#0B2545]">Manhattan</div>
              <div className="text-[10px] text-slate-500 mt-1">Midtown, Downtown, Industrial Docks</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="font-bold text-sm text-[#0B2545]">The Bronx</div>
              <div className="text-[10px] text-slate-500 mt-1">Hunts Point Food Market, Port Morris</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="font-bold text-sm text-[#0B2545]">Staten Island</div>
              <div className="text-[10px] text-slate-500 mt-1">Teleport, Howland Hook Marine Terminal</div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. CORPORATE FOOTER */}
      <footer className="bg-[#0B2545] text-white pt-16 pb-12 border-t border-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Column 1: Company Profile */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src="logo/logo.png" 
                  alt="Willy Fast Solutions Logo" 
                  className="h-10 w-auto object-contain brightness-110"
                />
                <span className="font-black text-lg tracking-tight text-white leading-tight">
                  WILLY FAST SOLUTIONS CORP
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === "es"
                  ? "Taller mecánico comercial y servicio móvil especializado en montacargas, mangueras hidráulicas de 6,000 PSI, transpaletas y retroexcavadoras en Nueva York."
                  : "Commercial forklift repair, mobile hydraulic hose manufacturing up to 6,000 PSI, pallet jacks, and heavy machinery services across Metro New York."}
              </p>
              <div className="text-xs text-amber-400 font-bold">
                Licensed & Insured Commercial Contractor
              </div>
            </div>

            {/* Column 2: Commercial Services */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                {lang === "es" ? "Servicios Comerciales" : "Commercial Services"}
              </h4>
              <ul className="text-xs text-slate-300 space-y-2">
                <li><a href="#services" className="hover:text-white transition-colors">24/7 Mobile Forklift Repair</a></li>
                <li><a href="#hydraulic-hoses" className="hover:text-white transition-colors">Hydraulic Hoses up to 6,000 PSI</a></li>
                <li><a href="#pallet-jacks" className="hover:text-white transition-colors">Pallet Jack Sales & Pump Rebuilds</a></li>
                <li><a href="#tires-pressing" className="hover:text-white transition-colors">Forklift Tires & Mobile Pressing</a></li>
                <li><a href="#equipment-sales" className="hover:text-white transition-colors">Certified Equipment Sales</a></li>
              </ul>
            </div>

            {/* Column 3: Facility & Contacts */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                {lang === "es" ? "Taller & Contacto" : "Depot & Contact"}
              </h4>
              <ul className="text-xs text-slate-300 space-y-2.5">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>97-20 102nd St, Ozone Park, Queens NY 11416</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <a href="tel:+17184042038" className="hover:text-white transition-colors font-bold">+1 (718) 404-2038</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <a href="mailto:info@willyfastsolutions.com" className="hover:text-white transition-colors">info@willyfastsolutions.com</a>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <span>24/7 Field Service • Shop: Mon–Sat 7am–6pm</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Dedicated Portals */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                {lang === "es" ? "Portales Corporativos" : "Corporate Portals"}
              </h4>
              <div className="space-y-2">
                <a 
                  href="software/"
                  onClick={(e) => {
                    if (typeof window !== "undefined" && window.location.protocol === "file:") {
                      e.preventDefault();
                      window.location.href = "software/index.html";
                    }
                  }}
                  className="block p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Fleet Software Division</span>
                    <Cpu className="h-3.5 w-3.5 text-blue-300" />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Autonomous telemetry & OSHA checklists</div>
                </a>

                <a 
                  href="login/"
                  onClick={(e) => {
                    if (typeof window !== "undefined" && window.location.protocol === "file:") {
                      e.preventDefault();
                      window.location.href = "login/index.html";
                    }
                  }}
                  className="block p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Client Maintenance Portal</span>
                    <Wrench className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Company dashboard & repair histories</div>
                </a>
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              © 2026 Willy Fast Solutions Corp. All rights reserved. Ozone Park, Queens, NY.
            </div>
            <div className="flex items-center gap-4">
              <span>English & Spanish Customer Service</span>
              <span>•</span>
              <a href="tel:+17184042038" className="text-amber-400 font-bold hover:underline">
                (718) 404-2038
              </a>
            </div>
          </div>

        </div>
      </footer>

      {/* 12. WRITE REVIEW MODAL */}
      <AnimatePresence>
        {reviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h3 className="text-lg font-black text-[#0B2545]">
                  {lang === "es" ? "Dejar Reseña Verificada de Servicio" : "Submit Verified Service Review"}
                </h3>
                <button
                  onClick={() => setReviewModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {reviewSuccessMessage ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold text-center">
                  {reviewSuccessMessage}
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">{lang === "es" ? "Su Nombre" : "Your Name"}</label>
                    <input 
                      type="text" 
                      required
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700">{lang === "es" ? "Empresa (Opcional)" : "Company (Optional)"}</label>
                    <input 
                      type="text" 
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      placeholder="e.g. Queens Freight LLC"
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700">{lang === "es" ? "Calificación" : "Rating"}</label>
                      <select 
                        value={newRating}
                        onChange={(e) => setNewRating(Number(e.target.value))}
                        className="w-full h-10 px-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]"
                      >
                        <option value={5}>★★★★★ (5 Estrellas)</option>
                        <option value={4}>★★★★☆ (4 Estrellas)</option>
                        <option value={3}>★★★☆☆ (3 Estrellas)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700">{lang === "es" ? "Ubicación" : "Location"}</label>
                      <input 
                        type="text" 
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="Queens, NY"
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700">{lang === "es" ? "Tipo de Servicio Recibido" : "Service Received"}</label>
                    <select 
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      className="w-full h-10 px-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]"
                    >
                      <option value="Forklift Repair">Forklift Repair & Diagnostics</option>
                      <option value="Hydraulic Hoses">Hydraulic Hoses (6,000 PSI)</option>
                      <option value="Pallet Jack Service">Pallet Jack Repair / Sales</option>
                      <option value="Forklift Tires">Forklift Tires & Mobile Pressing</option>
                      <option value="Preventive Maintenance">Preventive Maintenance (PM)</option>
                      <option value="Equipment Sales">Machinery Sales</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700">{lang === "es" ? "Comentario / Experiencia" : "Review Details"}</label>
                    <textarea 
                      rows={3} 
                      required
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your experience with our response time, mechanics, and pricing..."
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545] resize-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewModalOpen(false)}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
                    >
                      {lang === "es" ? "Cancelar" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="px-5 py-2 rounded-lg bg-[#0B2545] text-white text-xs font-bold hover:bg-[#133b68]"
                    >
                      {isSubmittingReview ? "Submitting..." : (lang === "es" ? "Publicar Reseña" : "Submit Review")}
                    </button>
                  </div>
                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
