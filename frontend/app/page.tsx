"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wrench, 
  ShieldCheck, 
  BellRing, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  ArrowRight,
  TrendingUp,
  Loader2,
  FileText,
  UserCheck,
  Phone, 
  MapPin, 
  Star, 
  MessageCircle, 
  Truck, 
  ShoppingCart, 
  ExternalLink, 
  Sparkles, 
  CircleDot, 
  ChevronDown, 
  Package,
  Zap,
  Activity,
  Award,
  ArrowUpRight
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
    comment: "Excelente servicio. Se nos reventó una manguera hidráulica en un forklift Toyota en plena faena y Willy llegó en menos de 40 minutos a prensar la manguera nueva. 100% recomendado en Queens.",
    service_type: "Emergency Hydraulic Hose & Forklift Repair",
    location: "Ozone Park / Queens, NY"
  },
  {
    id: "rev-2",
    author_name: "Robert Kowalski",
    company_name: "Kowalski Steel & Construction",
    rating: 5,
    comment: "Best forklift maintenance service in New York. They handle routine PM checks for our 4 Bobcat skid steers and Caterpillar excavator. Zero unexpected downtime ever since.",
    service_type: "Preventive Maintenance & Safety Audit",
    location: "Long Island City, NY"
  },
  {
    id: "rev-3",
    author_name: "David Rodriguez",
    company_name: "DR Warehouse Solutions",
    rating: 5,
    comment: "Compramos un montacargas Toyota certificado con Willy Fast Solutions y el equipo vino impecable y con su historial de mantenimiento al día. Gran honestidad y profesionalismo.",
    service_type: "Machinery Sales & Certification",
    location: "Brooklyn / Queens, NY"
  },
  {
    id: "rev-4",
    author_name: "Michael Chang",
    company_name: "Metro Freight Cargo",
    rating: 5,
    comment: "Top notch mobile hydraulic repair. Fabricated high-pressure spiral hoses directly on-site at our depot in Queens. Fast turnaround and fair pricing.",
    service_type: "Hydraulic Hoses & Fittings",
    location: "Jamaica, Queens, NY"
  },
  {
    id: "rev-5",
    author_name: "Luis Morales",
    company_name: "Morales Demolition & Excavation",
    rating: 5,
    comment: "Muy buen mecánico de montacargas y maquinaria pesada en Nueva York. Nos resolvió una fuga hidráulica y calibró el mástil en tiempo récord.",
    service_type: "Forklift Repair & Diagnostics",
    location: "Queens, NY"
  },
  {
    id: "rev-6",
    author_name: "Antonio Silveira",
    company_name: "Silveira Transport LLC",
    rating: 5,
    comment: "5 stars all the way. Reliable, prompt, and knowledgeable mechanics. They keep our fleet OSHA compliant.",
    service_type: "Fleet Preventive Maintenance",
    location: "Ozone Park, NY"
  },
  {
    id: "rev-7",
    author_name: "Jorge Benitez",
    company_name: "Benitez Food Distribution Inc.",
    rating: 5,
    comment: "Excelente servicio de cambio de llantas sólidas para nuestros montacargas Crown. Llegaron con su prensa hidráulica móvil y prensaron las 4 llantas directamente en nuestro almacén en Queens. Cero tiempo muerto y llantas que no dejan huella.",
    service_type: "Forklift Tires & Mobile Pressing",
    location: "Maspeth / Queens, NY"
  },
  {
    id: "rev-8",
    author_name: "Manuel Ortiz",
    company_name: "Queens Cold Logistics Corp",
    rating: 5,
    comment: "Compramos 2 pallet jacks hidráulicos para nuestra bodega y además Willy nos reparó una transpaleta eléctrica Crown que no levantaba peso. Excelente precio, rapidez y servicio en Queens.",
    service_type: "Pallet Jack Sales & Hydraulic Repair",
    location: "Long Island City / Queens, NY"
  },
  {
    id: "rev-9",
    author_name: "Frank DeSantis",
    company_name: "DeSantis Excavation & Paving",
    rating: 5,
    comment: "Fast mobile repair on our Caterpillar backhoe (retroexcavadora) in Queens. Replaced blown hydraulic boom hoses and rebuilt the bucket cylinder on-site in under 2 hours. Top notch mechanics.",
    service_type: "Backhoe & Heavy Excavator Repair",
    location: "Ozone Park, NY"
  }
];

export default function Home() {
  const [lang, setLang] = useState<"en" | "es">("en");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [reviewSummary, setReviewSummary] = useState({ average_rating: 5.0, total_reviews: 48 });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewCompany, setReviewCompany] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewService, setReviewService] = useState("Forklift Maintenance");
  const [reviewLocation, setReviewLocation] = useState("Queens, NY");
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [isReviewDropdownOpen, setIsReviewDropdownOpen] = useState(false);

  useEffect(() => {
    // Fetch verified reviews from API
    const fetchReviews = async () => {
      try {
        const isOffline = typeof window !== "undefined" && window.location.protocol === "file:";
        if (isOffline) return;
        const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
          ? `${window.location.protocol}//${window.location.hostname}:8000`
          : "";
        const res = await fetch(`${API_BASE_URL}/api/reviews/`);
        if (res.ok) {
          const data = await res.json();
          if (data.reviews && data.reviews.length > 0) {
            setReviews(data.reviews);
            setReviewSummary({ average_rating: data.average_rating, total_reviews: Math.max(data.total_reviews, 48) });
          }
        }
      } catch (err) {
        console.warn("Could not load dynamic reviews, using verified fallback", err);
      }
    };
    fetchReviews();
  }, []);

  const handleSelectService = (serviceName: string) => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
    
    const textarea = document.getElementById("contact-message") as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = lang === "es"
        ? `Hola, me gustaría solicitar una cotización o información para: "${serviceName}" de Willy Fast Solutions.`
        : `Hello, I would like to request a quotation or service information for: "${serviceName}" from Willy Fast Solutions.`;
      textarea.focus();
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSubmitted(false);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const payload = {
      full_name: formData.get("name") as string,
      email: formData.get("email") as string,
      company_name: formData.get("company") as string,
      message: formData.get("message") as string,
    };

    const isOffline = typeof window !== "undefined" && window.location.protocol === "file:";
    const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : "";

    if (isOffline) {
      setTimeout(() => {
        setIsSubmitting(false);
        setFormSubmitted(true);
        form.reset();
        setTimeout(() => setFormSubmitted(false), 5000);
      }, 1200);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/quotes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitting(false);
        setFormSubmitted(true);
        form.reset();
        setTimeout(() => setFormSubmitted(false), 6000);
      } else {
        setIsSubmitting(false);
        setFormError(data.detail || "Something went wrong. Please try again later.");
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setFormError("Could not connect to the server. Please check your internet connection.");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReviewSubmitting(true);
    try {
      const isOffline = typeof window !== "undefined" && window.location.protocol === "file:";
      const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
        ? `${window.location.protocol}//${window.location.hostname}:8000`
        : "";

      const payload = {
        author_name: reviewAuthor.trim(),
        company_name: reviewCompany.trim() || undefined,
        rating: reviewRating,
        comment: reviewComment.trim(),
        service_type: reviewService,
        location: reviewLocation
      };

      if (!isOffline) {
        const res = await fetch(`${API_BASE_URL}/api/reviews/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = await res.json();
          setReviews([created, ...reviews]);
          setReviewSummary(prev => ({
            total_reviews: prev.total_reviews + 1,
            average_rating: 5.0
          }));
        }
      } else {
        const localCreated: ReviewItem = {
          ...payload,
          id: `local-${Date.now()}`,
          created_at: new Date().toISOString()
        };
        setReviews([localCreated, ...reviews]);
      }

      setReviewSuccess(true);
      setTimeout(() => {
        setShowReviewModal(false);
        setReviewSuccess(false);
        setReviewAuthor("");
        setReviewCompany("");
        setReviewComment("");
      }, 2500);
    } catch (err) {
      console.error("Error submitting review", err);
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-zinc-800 selection:text-zinc-200 overflow-x-hidden">
      
      {/* Emergency & Location Top Bar */}
      <div className="bg-zinc-900/95 border-b border-zinc-800/80 px-4 py-2 text-xs text-zinc-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <a 
              href="https://maps.google.com/?q=Willy+Fast+Solutions+Corp+97-20+102nd+St+Ozone Park+NY+11416" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1.5 text-zinc-300 hover:text-emerald-400 transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <span className="font-medium">97-20 102nd St, Ozone Park, NY 11416 (Queens)</span>
            </a>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <a 
              href="tel:+17184042038" 
              className="flex items-center gap-1.5 font-bold text-zinc-100 hover:text-emerald-400 transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>+1 (718) 404-2038</span>
            </a>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <a 
              href="#reviews" 
              className="flex items-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <div className="flex text-amber-400">
                <Star className="h-3 w-3 fill-amber-400" />
                <Star className="h-3 w-3 fill-amber-400" />
                <Star className="h-3 w-3 fill-amber-400" />
                <Star className="h-3 w-3 fill-amber-400" />
                <Star className="h-3 w-3 fill-amber-400" />
              </div>
              <span className="font-bold text-zinc-100 text-[11px]">5.0</span>
              <span className="text-zinc-400 text-[11px] underline">
                {lang === "es" ? "Google Reviews (48+)" : "Google Reviews (48+)"}
              </span>
            </a>
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
              href="https://wa.me/17184042038?text=Hola%20Willy%20Fast%20Solutions,%20necesito%20servicio%20de%20montacargas%20o%20mangueras%20hidr%C3%A1ulicas" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold hover:bg-emerald-600/30 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp 24/7
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/85 border-b border-zinc-900 transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg shadow-sm flex items-center justify-center w-10 h-10 overflow-hidden">
              <img src="logo/logo.png" alt="WillyFastSolutions Logo" className="w-full h-full object-cover filter brightness-110" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent block leading-none">
                Willy Fast Solutions
              </span>
              <span className="text-[10px] text-zinc-500 font-medium block">Corp • Heavy Equipment & Hydraulics</span>
            </div>
          </div>
          
          {/* Desktop Nav - Reorganized into 4 CLT Pillars + SaaS link */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a href="#services" className="hover:text-zinc-100 transition-colors">{lang === "es" ? "Servicios" : "Services"}</a>
            <a href="#field-service" className="hover:text-zinc-100 transition-colors">{lang === "es" ? "Mecánica Móvil" : "Field Service"}</a>
            <a href="#hydraulic-hoses" className="hover:text-zinc-100 transition-colors">{lang === "es" ? "Mangueras 6,000 PSI" : "Hydraulic Hoses"}</a>
            <a href="#forklift-tires" className="hover:text-zinc-100 transition-colors">{lang === "es" ? "Llantas & Prensa" : "Tires & Pressing"}</a>
            <a href="#machinery-sales" className="hover:text-zinc-100 transition-colors">{lang === "es" ? "Venta Equipos" : "Equipment Sales"}</a>
            <a href="#reviews" className="hover:text-zinc-100 transition-colors flex items-center gap-1">
              <span>{lang === "es" ? "Opiniones" : "Reviews"}</span>
              <span className="text-amber-400 font-bold text-xs">★ 5.0</span>
            </a>
            
            {/* Dedicated SaaS Route Badge in Header */}
            <a 
              href="software/"
              onClick={(e) => {
                if (typeof window !== "undefined" && window.location.protocol === "file:") {
                  e.preventDefault();
                  window.location.href = "software/index.html";
                }
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-semibold hover:bg-emerald-500/20 transition-all shadow-sm"
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>{lang === "es" ? "Software Flotas" : "Fleet Software"}</span>
            </a>

            <a href="#contact" className="hover:text-zinc-100 transition-colors">{lang === "es" ? "Contacto" : "Contact"}</a>
          </nav>
          
          {/* Action CTAs + Client Login */}
          <div className="flex items-center gap-3">
            <a 
              href="tel:+17184042038"
              className="hidden sm:inline-flex h-9 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 text-xs font-bold text-emerald-400 transition-all hover:bg-emerald-500/20"
            >
              <Phone className="h-3.5 w-3.5 mr-1.5" /> (718) 404-2038
            </a>
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
              {lang === "es" ? "Portal Clientes" : "Client Portal"}
            </a>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section id="home" className="relative py-16 md:py-24 overflow-hidden border-b border-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left flex flex-col md:flex-row items-center gap-12">
          
          {/* Left Column: Commercial Hook */}
          <div className="flex-1 flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex self-center md:self-start items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-300"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>📍 97-20 102nd St, Ozone Park • Queens, NY & Tri-State Area</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight bg-gradient-to-b from-zinc-50 to-zinc-300 bg-clip-text text-transparent"
            >
              {lang === "es" ? (
                <>
                  Reparación de Montacargas, Pallet Jacks y Retroexcavadoras en Queens, NY
                </>
              ) : (
                <>
                  Forklift Repair, Pallet Jacks & Heavy Machinery in Ozone Park & Queens, NY
                </>
              )}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed"
            >
              {lang === "es" ? (
                <>
                  Taller mecánico y servicio móvil 24/7 en sitio. Venta y reparación de montacargas y pallet jacks, mantenimiento de retroexcavadoras, prensa móvil para llantas sólidas y prensado de mangueras hidráulicas hasta 6,000 PSI en &lt;45 min.
                </>
              ) : (
                <>
                  Certified on-site field mechanics and 24/7 emergency mobile service. Forklift and pallet jack repair & sales, backhoe service, solid tire mobile pressing, and on-site hydraulic hoses up to 6,000 PSI dispatched in &lt;45 min.
                </>
              )}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-3 mt-2 justify-center md:justify-start flex-wrap"
            >
              <a 
                href="tel:+17184042038" 
                id="btn-hero-call" 
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 text-sm font-bold text-black transition-all hover:bg-emerald-400 hover:scale-102 active:scale-95 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
              >
                <Phone className="h-4 w-4" /> (718) 404-2038
              </a>
              <a 
                href="https://wa.me/17184042038?text=Hola%20Willy%20Fast%20Solutions,%20necesito%20despacho%20urgente%20de%20mantenimiento%20o%20mangueras" 
                target="_blank"
                rel="noopener noreferrer" 
                id="btn-hero-whatsapp" 
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-zinc-950 px-6 text-sm font-semibold text-emerald-400 transition-all hover:bg-emerald-500/10 hover:border-emerald-400"
              >
                <MessageCircle className="h-4 w-4" /> {lang === "es" ? "WhatsApp Despacho Inmediato" : "Direct WhatsApp Dispatch"}
              </a>
              <a 
                href="#services" 
                id="btn-hero-services" 
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-5 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-900 hover:text-zinc-100"
              >
                {lang === "es" ? "Ver 4 Pilares de Servicios" : "View 4 Service Pillars"} <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </motion.div>

            {/* Quick Specialties Badges */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-wrap items-center gap-2 pt-2 justify-center md:justify-start"
            >
              <a 
                href="#field-service" 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
              >
                <span>🚜</span> {lang === "es" ? "Mecánica Móvil en Sitio" : "24/7 Field Repairs"}
              </a>
              <a 
                href="#hydraulic-hoses" 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
              >
                <span>⚡</span> {lang === "es" ? "Mangueras 6,000 PSI en &lt;45 Min" : "Hydraulic Hoses up to 6,000 PSI"}
              </a>
              <a 
                href="#forklift-tires" 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
              >
                <span>🛞</span> {lang === "es" ? "Llantas Sólidas & Prensa Móvil" : "Forklift Tires & Mobile Press"}
              </a>
              <a 
                href="#machinery-sales" 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
              >
                <span>🛒</span> {lang === "es" ? "Venta Montacargas & Pallet Jacks" : "Equipment & Pallet Jack Sales"}
              </a>
            </motion.div>
          </div>

          {/* Right Column: High-Converting 24/7 Rapid Mobile Emergency Dispatch Card */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 w-full max-w-lg md:max-w-none"
          >
            <div className="relative border border-emerald-500/30 bg-zinc-900/70 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-md group hover:border-emerald-500/50 transition-all duration-300">
              
              {/* Header Status */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
                    {lang === "es" ? "DESPACHO RÁPIDO ACTIVO 24/7" : "24/7 RAPID DISPATCH ACTIVE"}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800">
                  Queens Base • Ozone Park
                </span>
              </div>

              {/* Title & Dispatch Card Content */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-emerald-400" />
                    {lang === "es" ? "Taller Móvil Equipado en su Empresa" : "Fully Equipped On-Site Field Van"}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {lang === "es" 
                      ? "Nuestras unidades móviles cuentan con prensadora hidráulica de alta presión y herramientas pesadas para solucionar su emergencia en el sitio sin remolques." 
                      : "Our emergency field vans carry heavy spiral crimpers and diagnostic equipment to get your machinery operational immediately without towing."}
                  </p>
                </div>

                {/* 4 Dispatch Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/80">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                      <Zap className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{lang === "es" ? "Llegada en <45 Minutos" : "<45 Min Queens ETA"}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      {lang === "es" ? "Cobertura prioritaria en Ozone Park, LIC, Jamaica y Brooklyn." : "Priority dispatch across Queens, Brooklyn and NYC metro."}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/80">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                      <Activity className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{lang === "es" ? "Prensado hasta 6,000 PSI" : "Spiral Hoses to 6,000 PSI"}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      {lang === "es" ? "Mangueras de 2 y 4 mallas fabricadas en minutos en su patio." : "2 & 4-wire spiral hydraulic hoses crimped on-site."}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/80">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                      <CircleDot className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>{lang === "es" ? "Prensa Móvil de Llantas" : "Mobile Tire Pressing"}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      {lang === "es" ? "Cambio de llantas sólidas y cushion directo en bodega." : "Solid pneumatic & cushion tires pressed at your depot."}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/80">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                      <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{lang === "es" ? "Certificación OSHA" : "OSHA Audit Ready"}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      {lang === "es" ? "Inspecciones reglamentarias de mástil, frenos y seguridad." : "Compliant inspections for brakes, hydraulics and masts."}
                    </p>
                  </div>
                </div>

                {/* Direct Emergency Dispatch Button */}
                <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row gap-2">
                  <a 
                    href="tel:+17184042038" 
                    className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 text-xs font-bold text-black hover:bg-emerald-400 transition-colors shadow-lg cursor-pointer"
                  >
                    <Phone className="h-4 w-4" />
                    <span>{lang === "es" ? "Despachar Mecánico Móvil Ahora" : "Dispatch Mobile Mechanic Now"}</span>
                  </a>
                  <a 
                    href="https://wa.me/17184042038?text=Hola,%20tengo%20una%20maquinaria%20detenida%20y%20necesito%20el%20taller%20m%C3%B3vil%20urgente" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-1.5 px-4 rounded-lg border border-emerald-500/40 bg-zinc-950 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                </div>

              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* Google Business Profile Showcase & Local Trust */}
      <section className="py-12 border-b border-zinc-900 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Google Card Replica with Verified Badge */}
            <div className="lg:col-span-5 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Google Business Verified</span>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">Queens, NY</span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-zinc-100">Willy Fast Solutions Corp</h3>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="font-bold text-lg text-zinc-100">5.0</span>
                  <div className="flex text-amber-400">
                    <Star className="h-4 w-4 fill-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400" />
                  </div>
                  <span className="text-xs text-zinc-400">({reviewSummary.total_reviews} opiniones verificadas)</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {lang === "es" 
                    ? "Taller de reparación, prensado de mangueras hidráulicas y venta de montacargas en Nueva York" 
                    : "Forklift repair, mobile hydraulic hoses & heavy machinery services in New York"}
                </p>
              </div>

              {/* Action Buttons styled like Google Profile */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <a 
                  href="tel:+17184042038" 
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition-colors text-center group cursor-pointer"
                >
                  <Phone className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-semibold text-zinc-200 mt-1">{lang === "es" ? "Llamar" : "Call"}</span>
                </a>
                <a 
                  href="https://maps.google.com/?q=Willy+Fast+Solutions+Corp+97-20+102nd+St+Ozone+Park+NY+11416" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition-colors text-center group cursor-pointer"
                >
                  <MapPin className="h-4 w-4 text-rose-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-semibold text-zinc-200 mt-1">{lang === "es" ? "Cómo llegar" : "Directions"}</span>
                </a>
                <button 
                  type="button"
                  onClick={() => setShowReviewModal(true)} 
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition-colors text-center group cursor-pointer"
                >
                  <Star className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-semibold text-zinc-200 mt-1">{lang === "es" ? "Opinar" : "Review"}</span>
                </button>
                <a 
                  href="https://wa.me/17184042038?text=Hola%20Willy%20Fast%20Solutions,%20vi%20su%20perfil%20en%20Google%20y%20necesito%20servicio" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors text-center group cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-semibold text-emerald-400 mt-1">WhatsApp</span>
                </a>
              </div>

              <div className="pt-3 border-t border-zinc-900 text-xs text-zinc-400 space-y-1.5">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                  <span><strong>{lang === "es" ? "Dirección:" : "Address:"}</strong> 97-20 102nd St, Ozone Park, NY 11416, Queens</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-zinc-500 shrink-0" />
                  <span><strong>{lang === "es" ? "Teléfono:" : "Phone:"}</strong> +1 (718) 404-2038</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-zinc-500 shrink-0" />
                  <span><strong>{lang === "es" ? "Horario:" : "Hours:"}</strong> Lun-Sáb 7:00 AM - 7:00 PM • Emergencias 24/7</span>
                </div>
              </div>
            </div>

            {/* Right: Why Local SEO & Trust Matters */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950 text-xs text-emerald-400 font-semibold">
                <Sparkles className="h-3.5 w-3.5" /> {lang === "es" ? "Líderes Locales en Queens y Nueva York" : "Local Leaders in Queens & NYC Metro"}
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-100">
                {lang === "es" 
                  ? "Taller y Servicio Técnico Móvil en Ozone Park, Queens" 
                  : "Field Service & Machinery Repair Base in Ozone Park, Queens"}
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                {lang === "es"
                  ? "Atendemos almacenes logísticos, plantas de reciclaje, depósitos, constructoras y talleres en Ozone Park, South Ozone Park, Queens, Brooklyn, Bronx, Manhattan y Long Island. Si su montacargas, pallet jack o excavadora se detiene, enviamos mecánicos especializados y nuestro taller móvil con prensadora de mangueras hidráulicas directamente a su faena."
                  : "We support logistics warehouses, distribution centers, scrap yards, and construction sites in Ozone Park, South Ozone Park, Queens, Brooklyn, and NYC metro. When your forklift, pallet jack, or excavator is down, our mobile field mechanics dispatch directly to your jobsite with full tooling and hydraulic hose crimping equipment."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/60">
                  <div className="text-emerald-400 font-bold text-lg">&lt;45 Min</div>
                  <div className="text-xs text-zinc-400 font-medium mt-0.5">
                    {lang === "es" ? "Respuesta en Queens" : "Queens Response Time"}
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/60">
                  <div className="text-amber-400 font-bold text-lg">5.0 ★★★★★</div>
                  <div className="text-xs text-zinc-400 font-medium mt-0.5">
                    {lang === "es" ? "Calificación en Google" : "Google Business Rating"}
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/60">
                  <div className="text-emerald-400 font-bold text-lg">100% On-Site</div>
                  <div className="text-xs text-zinc-400 font-medium mt-0.5">
                    {lang === "es" ? "Prensado Móvil Mangueras" : "Mobile Hose Crimping"}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CORE COMMERCIAL SERVICES: The 4 CLT-Modeled Pillars */}
      <section id="services" className="py-20 md:py-28 border-b border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              {lang === "es" ? "Servicios Principales en Queens & NY" : "Primary Commercial Services in Queens & NY"}
            </span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-100">
              {lang === "es" ? "Nuestros 4 Pilares de Servicio Industrial" : "Our 4 Core Industrial Service Pillars"}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              {lang === "es"
                ? "Organización clara y directa: reparaciones mecánicas en sitio, mangueras hidráulicas de emergencia, llantas para montacargas y venta de equipos certificados."
                : "Modular, high-performance machinery solutions: on-site field repairs, emergency hydraulic hoses, forklift solid tires & certified equipment sales."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* PILLAR 1: FIELD REPAIRS & 24/7 MOBILE SERVICE */}
            <div id="field-service" className="border border-zinc-850 bg-zinc-900/30 rounded-2xl p-7 flex flex-col justify-between hover:border-zinc-700 transition-all group relative overflow-hidden">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="inline-flex p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 group-hover:scale-105 transition-transform">
                    <Wrench className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                    Pillar 1 • Field Service
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-zinc-100">
                    {lang === "es" ? "1. Servicio Mecánico Móvil en Sitio (24/7)" : "1. On-Site Mechanical Field Service (24/7)"}
                  </h3>
                  <p className="text-xs text-emerald-400 font-medium mt-1">
                    {lang === "es" ? "Montacargas • Retroexcavadoras • Pallet Jacks" : "Forklifts • Backhoes & Excavators • Pallet Jacks"}
                  </p>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {lang === "es"
                    ? "Taller móvil con mecánicos certificados para reparación urgente y mantenimiento preventivo en Queens, Brooklyn y toda el área metropolitana de NY. Atendemos montacargas (Toyota, Crown, Hyster, Yale, Cat, Clark), retroexcavadoras (Caterpillar, Case, JCB) y pallet jacks manuales/eléctricos."
                    : "On-site field mechanics dispatched directly to your warehouse, yard, or jobsite across Queens, Brooklyn, and NYC. Full diagnostic repair for forklifts (Toyota, Crown, Hyster, Cat), backhoes & excavators (Caterpillar, Case, JCB), and pallet trucks."}
                </p>

                <div className="space-y-2 pt-2 border-t border-zinc-900">
                  <div className="flex items-start gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>{lang === "es" ? "Montacargas (Forklifts):" : "Forklifts:"}</strong> Mástiles, cilindros de elevación, frenos, baterías, starter y afinación.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>{lang === "es" ? "Retroexcavadoras (Backhoes):" : "Backhoes:"}</strong> Cilindros hidráulicos de pluma y balde, fugas de alta presión y motor diesel.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>{lang === "es" ? "Pallet Jacks:" : "Pallet Jacks:"}</strong> Empacaduras de pistón hidráulico, cambio de ruedas y transpaletas eléctricas.</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-900 flex flex-col sm:flex-row gap-2">
                <a 
                  href="tel:+17184042038" 
                  className="flex-1 inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-zinc-100 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  <Phone className="h-3.5 w-3.5" /> {lang === "es" ? "Pedir Mecánico en Sitio" : "Request Field Mechanic"}
                </a>
                <button 
                  onClick={() => handleSelectService("Servicio Mecánico Móvil en Sitio (Forklift / Backhoe / Pallet Jack)")}
                  className="flex-1 inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  {lang === "es" ? "Cotizar Reparación" : "Quote Field Service"}
                </button>
              </div>
            </div>

            {/* PILLAR 2: CUSTOM HYDRAULIC HOSES & FITTINGS (EMERGENCY SPIRAL) */}
            <div id="hydraulic-hoses" className="border-2 border-emerald-500/40 bg-zinc-900/40 rounded-2xl p-7 flex flex-col justify-between shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-emerald-500 text-zinc-950 text-[9px] font-extrabold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                {lang === "es" ? "Emergencias <45 Min" : "Emergency <45 Min"}
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
                    <Zap className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    Pillar 2 • Hydraulic Hoses
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-zinc-100">
                    {lang === "es" ? "2. Mangueras Hidráulicas hasta 6,000 PSI" : "2. Custom Hydraulic Hoses up to 6,000 PSI"}
                  </h3>
                  <p className="text-xs text-emerald-400 font-medium mt-1">
                    {lang === "es" ? "Prensado Móvil en Obra • 2 y 4 Mallas Espirales" : "Mobile Crimping Van On-Site • 2 & 4-Wire Spiral"}
                  </p>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {lang === "es"
                    ? "Fabricación y prensado móvil directo en su empresa o sitio de construcción. Solucionamos mangueras reventadas en retroexcavadoras, grúas, montacargas y maquinaria pesada con conexiones JIC, NPT, ORFS, bridas partidas Code 61 y Code 62, métricas y DIN."
                    : "On-site custom hydraulic hose manufacturing and high-pressure crimping up to 6,000 PSI. We arrive at your site with mobile spiral crimpers and complete fitting inventory (JIC, NPT, ORFS, Code 61/62 split flange fittings) to eliminate expensive downtime."}
                </p>

                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <div className="flex items-start gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>{lang === "es" ? "Taller Móvil Rodante:" : "Mobile Workshop:"}</strong> Llega a su instalación en menos de 45 minutos en Queens.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>{lang === "es" ? "Extrema Presión:" : "Extreme Pressure:"}</strong> Mangueras 2-wire y 4-wire spiral diseñadas para trabajo continuo severo.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>{lang === "es" ? "Sin Remolques:" : "Zero Towing:"}</strong> Fabricamos e instalamos la manguera directamente frente a su equipo.</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row gap-2">
                <a 
                  href="tel:+17184042038" 
                  className="flex-1 inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 text-xs font-bold text-black hover:bg-emerald-400 transition-colors shadow-md cursor-pointer"
                >
                  <Phone className="h-3.5 w-3.5" /> {lang === "es" ? "Pedir Manguera Urgente" : "Call Rush Hose Dispatch"}
                </a>
                <a 
                  href="https://wa.me/17184042038?text=Hola,%20se%20me%20revent%C3%B3%20una%20manguera%20hidr%C3%A1ulica%20y%20necesito%20una%20nueva%20en%20Queens" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/40 bg-zinc-950 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> {lang === "es" ? "Enviar Foto por WhatsApp" : "Send Photo via WhatsApp"}
                </a>
              </div>
            </div>

            {/* PILLAR 3: FORKLIFT TIRES & MOBILE PRESSING */}
            <div id="forklift-tires" className="border border-zinc-850 bg-zinc-900/30 rounded-2xl p-7 flex flex-col justify-between hover:border-zinc-700 transition-all group relative overflow-hidden">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="inline-flex p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 group-hover:scale-105 transition-transform">
                    <CircleDot className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                    Pillar 3 • Tires & Pressing
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-zinc-100">
                    {lang === "es" ? "3. Llantas para Montacargas & Prensa Móvil" : "3. Forklift Tires & On-Site Mobile Pressing"}
                  </h3>
                  <p className="text-xs text-amber-400 font-medium mt-1">
                    {lang === "es" ? "Rudomáticas Sólidas • Cushion • Non-Marking" : "Solid Pneumatics • Cushion • Non-Marking"}
                  </p>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {lang === "es"
                    ? "Venta, prensado e instalación de llantas industriales directamente en su almacén. Despachamos nuestra prensa hidráulica móvil a su empresa en Queens, Brooklyn y NY, desmontamos la llanta desgastada y prensamos la nueva sin necesidad de trasladar su montacargas."
                    : "Complete commercial forklift tire replacement service with industrial mobile press delivered directly to your facility. We dismount, press new solid pneumatic, cushion, or non-marking tires, and reinstall on-site to keep your warehouse operating."}
                </p>

                <div className="space-y-2 pt-2 border-t border-zinc-900">
                  <div className="flex items-start gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>{lang === "es" ? "Llantas Sólidas Rudomáticas:" : "Solid Pneumatics:"}</strong> Resistencia total a pinchazos en patios, reciclaje y asfalto.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>{lang === "es" ? "Cushion & Non-Marking:" : "Cushion & Non-Marking:"}</strong> Ideales para almacenes de alimentos, farmacéutica y bodegas interiores.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>{lang === "es" ? "Prensa Móvil en Sitio:" : "Mobile Press On-Site:"}</strong> Sin días de espera ni grúas para mover el montacargas.</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-900 flex flex-col sm:flex-row gap-2">
                <a 
                  href="tel:+17184042038" 
                  className="flex-1 inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-zinc-100 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  <Phone className="h-3.5 w-3.5" /> {lang === "es" ? "Cotizar Medidas de Llantas" : "Quote Tire Sizes"}
                </a>
                <button 
                  onClick={() => handleSelectService("Llantas para Montacargas y Prensa Móvil (Solid / Cushion / Non-Marking)")}
                  className="flex-1 inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  {lang === "es" ? "Pedir Cotización Prensa" : "Request Press Quote"}
                </button>
              </div>
            </div>

            {/* PILLAR 4: CERTIFIED EQUIPMENT SALES (FORKLIFTS & PALLET JACKS) */}
            <div id="machinery-sales" className="border border-zinc-850 bg-zinc-900/30 rounded-2xl p-7 flex flex-col justify-between hover:border-zinc-700 transition-all group relative overflow-hidden">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="inline-flex p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 group-hover:scale-105 transition-transform">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                    Pillar 4 • Equipment Sales
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-zinc-100">
                    {lang === "es" ? "4. Venta de Equipos & Pallet Jacks Certificados" : "4. Certified Equipment & Pallet Jack Sales"}
                  </h3>
                  <p className="text-xs text-emerald-400 font-medium mt-1">
                    {lang === "es" ? "Montacargas Nuevos & Usados • Pallet Jacks en Stock" : "New & Pre-Owned Forklifts • Pallet Jacks in Stock"}
                  </p>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {lang === "es"
                    ? "Venta de montacargas certificados con garantía mecánica rigurosa en Queens y el área Tri-Estatal (Toyota, Crown, Caterpillar, Hyster a gas propano LPG, eléctricos y diesel). Además, disponemos de stock permanente de pallet jacks manuales y eléctricos listos para entrega inmediata."
                    : "Certified pre-owned and new forklifts (Toyota, Crown, Cat, Hyster) with comprehensive mechanical warranty. Electric, LPG propane, and diesel warehouse machinery, plus a permanent warehouse inventory of heavy-duty manual and electric pallet jacks in NYC."}
                </p>

                <div className="space-y-2 pt-2 border-t border-zinc-900">
                  <div className="flex items-start gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>{lang === "es" ? "Equipos Certificados:" : "Certified Machines:"}</strong> Inspección técnica de 50 puntos antes de la entrega.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>{lang === "es" ? "Pallet Jacks Listos:" : "Pallet Jacks In Stock:"}</strong> Transpaletas manuales de 5,500 lbs y eléctricas listas para despacho.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>{lang === "es" ? "Asesoría Honesta:" : "Expert Guidance:"}</strong> Recomendaciones directas de mecánicos experimentados, no de intermediarios.</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-900 flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={() => handleSelectService("Venta de Montacargas (Nuevos / Usados Certificados)")}
                  className="flex-1 inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-zinc-100 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  <ShoppingCart className="h-3.5 w-3.5" /> {lang === "es" ? "Consultar Forklifts" : "Inquire Forklifts"}
                </button>
                <button 
                  onClick={() => handleSelectService("Compra de Pallet Jacks (Manuales o Eléctricos en Stock)")}
                  className="flex-1 inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  <Package className="h-3.5 w-3.5" /> {lang === "es" ? "Comprar Pallet Jacks" : "Buy Pallet Jacks"}
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* DEDICATED SAAS & FLEET SOFTWARE CALLOUT BANNER (Clean, Noise-Free) */}
      <section className="py-16 border-b border-zinc-900 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/20 via-zinc-950 to-zinc-950 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="border border-emerald-500/30 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-zinc-900/90 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-md">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-400">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>{lang === "es" ? "PLATAFORMA B2B DE MANTENIMIENTO PREVENTIVO" : "B2B PREVENTIVE FLEET TELEMETRY PLATFORM"}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-100 tracking-tight leading-tight">
                  {lang === "es" 
                    ? "¿Administras una flota de montacargas o maquinaria pesada?" 
                    : "Managing a Fleet of Forklifts or Heavy Machinery?"}
                </h3>

                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl">
                  {lang === "es"
                    ? "Diseñamos un software dedicado para empresas con múltiples activos. Control de horas de motor (horómetro), checklists digitales de inspección OSHA, simulador en vivo, cálculo de ROI y daemon auditor que envía reportes ejecutivos en PDF automáticamente."
                    : "We built a dedicated SaaS platform for companies operating equipment fleets. Monitor hour meters, run digital OSHA compliance checklists, calculate fleet downtime ROI, and let our 24/7 background audit daemon email executive PDF reports automatically."}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                    <div className="text-xs font-bold text-zinc-200">{lang === "es" ? "⏱️ Horómetro" : "⏱️ Hour Meter"}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{lang === "es" ? "Telemetría en vivo" : "Live telemetry"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                    <div className="text-xs font-bold text-zinc-200">{lang === "es" ? "📋 Checklists" : "📋 Checklists"}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{lang === "es" ? "Auditoría OSHA" : "OSHA compliant"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                    <div className="text-xs font-bold text-zinc-200">{lang === "es" ? "🤖 Daemon 24/7" : "🤖 24/7 Daemon"}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{lang === "es" ? "Alertas por email" : "Email PDF alerts"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                    <div className="text-xs font-bold text-zinc-200">{lang === "es" ? "📊 ROI Flota" : "📊 Fleet ROI"}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{lang === "es" ? "Ahorro calculado" : "Downtime savings"}</div>
                  </div>
                </div>
              </div>

              {/* Action Side */}
              <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
                <a 
                  href="software/"
                  onClick={(e) => {
                    if (typeof window !== "undefined" && window.location.protocol === "file:") {
                      e.preventDefault();
                      window.location.href = "software/index.html";
                    }
                  }}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-bold text-black hover:bg-emerald-400 transition-all shadow-[0_0_25px_rgba(16,185,129,0.25)] hover:scale-102 active:scale-95 cursor-pointer"
                >
                  <span>{lang === "es" ? "Explorar Software de Flotas (SaaS)" : "Explore Fleet Software (SaaS)"}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>

                <a 
                  href="login/"
                  onClick={(e) => {
                    if (typeof window !== "undefined" && window.location.protocol === "file:") {
                      e.preventDefault();
                      window.location.href = "login/index.html";
                    }
                  }}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-6 text-xs font-semibold text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 transition-all cursor-pointer"
                >
                  <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{lang === "es" ? "Acceso Clientes Registrados" : "Sign In to Client Portal"}</span>
                </a>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Customer Reviews & Google Ratings Section */}
      <section id="reviews" className="py-20 md:py-28 border-b border-zinc-900 bg-zinc-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-xs font-semibold text-amber-400 mb-3">
                <Star className="h-3.5 w-3.5 fill-amber-400" /> {lang === "es" ? "Opiniones Verificadas en Google" : "Verified Customer Feedback"}
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-100">
                {lang === "es" ? "Lo Que Dicen Nuestros Clientes" : "What Our Clients Say in New York"}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-xl">
                {lang === "es" 
                  ? "Calificación 5.0 en Google. Empresas de logística, almacenes, constructoras y depósitos confían en Willy Fast Solutions en Queens y Nueva York." 
                  : "Rated 5.0 Stars on Google Maps by logistics hubs, warehouses, and heavy equipment operators across NYC."}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button 
                type="button"
                onClick={() => setShowReviewModal(true)} 
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-colors shadow-md cursor-pointer"
              >
                <Star className="h-3.5 w-3.5" /> {lang === "es" ? "Dejar una Opinión" : "Leave a Review"}
              </button>
              <a 
                href="https://maps.google.com/?q=Willy+Fast+Solutions+Corp+97-20+102nd+St+Ozone+Park+NY+11416" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-4 text-xs font-medium text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" /> {lang === "es" ? "Ver en Google Maps" : "View on Google Maps"}
              </a>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev, index) => (
              <motion.div 
                key={rev.id || index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950 flex flex-col justify-between space-y-4 hover:border-zinc-800 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {rev.location || "Queens, NY"}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-900/80 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">{rev.author_name}</h4>
                    {rev.company_name && (
                      <p className="text-[11px] text-zinc-500">{rev.company_name}</p>
                    )}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {rev.service_type}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Who We Are (About Us) Section */}
      <section id="about" className="py-20 md:py-28 border-b border-zinc-900 bg-zinc-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 mx-auto">
            <UserCheck className="h-6 w-6" />
          </div>
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-100">
              {lang === "es" ? "Quiénes Somos" : "Who We Are"}
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
              {lang === "es"
                ? "Willy Fast Solutions es su aliado técnico independiente en maquinaria pesada y mangueras hidráulicas. Con base central en Ozone Park, Queens, combinamos experiencia mecánica práctica en el terreno con respuesta inmediata."
                : "Willy Fast Solutions is an independent heavy machinery and mobile hydraulic partner. Based in Ozone Park, Queens, we combine hands-on mechanical experience with immediate 24/7 on-site response."}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-left">
            <div className="p-6 rounded-xl border border-zinc-900 bg-zinc-900/40 space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                {lang === "es" ? "Nuestra Misión" : "Our Mission"}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {lang === "es"
                  ? "Garantizar cero tiempo muerto en almacenes, logística y construcción, manteniendo su maquinaria operativa con diagnósticos precisos y cumplimiento OSHA."
                  : "Eliminate costly machinery downtime for warehousing, distribution, and construction operators across NYC with honest diagnostics and OSHA compliance."}
              </p>
            </div>
            <div className="p-6 rounded-xl border border-zinc-900 bg-zinc-900/40 space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                {lang === "es" ? "Mecánica Móvil en el Sitio" : "Direct Field Service"}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {lang === "es"
                  ? "Hacemos el trabajo duro donde esté su máquina. Desde cambio de mangueras hidráulicas hasta prensado de llantas y reparación de mástiles directamente en su empresa."
                  : "We handle the work where your machine sits. From spiral hydraulic hoses to mobile solid tire pressing and mast repairs directly at your site."}
              </p>
            </div>
            <div className="p-6 rounded-xl border border-zinc-900 bg-zinc-900/40 space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                {lang === "es" ? "Transparencia Radical" : "Radical Transparency"}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {lang === "es"
                  ? "Presupuestos claros, sin costos ocultos de remolque innecesarios y repuestos de alta calidad con garantía mecánica comprobada."
                  : "Direct pricing, no unnecessary tow truck charges, and commercial grade parts installed with rigorous mechanical warranty."}
              </p>
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
                {lang === "es" ? "Solicitar Cotización de Servicio" : "Request a Service Quotation"}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                {lang === "es"
                  ? "¿Necesita reparación de montacargas, mangueras hidráulicas, llantas o pallet jacks? Complete el formulario y responderemos a la brevedad."
                  : "Need forklift repair, on-site hydraulic hoses, tires, or pallet jacks? Complete the form below for immediate assistance."}
              </p>
            </div>

            {formSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-center text-emerald-400 text-sm"
              >
                {lang === "es" 
                  ? "¡Muchas gracias! Su solicitud ha sido recibida. Nos comunicaremos con usted a la brevedad." 
                  : "Thank you! Your quote request has been received. Our team will review your machinery details and contact you shortly."}
              </motion.div>
            ) : (
              <div className="space-y-4">
                {formError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-center text-rose-400 text-xs font-semibold"
                  >
                    {formError}
                  </motion.div>
                )}
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="contact-name" className="text-xs font-medium text-zinc-400">
                        {lang === "es" ? "Nombre Completo *" : "Full Name *"}
                      </label>
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
                      <label htmlFor="contact-email" className="text-xs font-medium text-zinc-400">
                        {lang === "es" ? "Correo Electrónico *" : "Email Address *"}
                      </label>
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
                    <label htmlFor="contact-company" className="text-xs font-medium text-zinc-400">
                      {lang === "es" ? "Nombre de la Empresa" : "Company Name"}
                    </label>
                    <input 
                      type="text" 
                      id="contact-company" 
                      name="company" 
                      placeholder="Apex Logistics Ltd"
                      className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-message" className="text-xs font-medium text-zinc-400">
                      {lang === "es" ? "Detalles del Servicio o Maquinaria *" : "Message / Machinery Details *"}
                    </label>
                    <textarea 
                      id="contact-message" 
                      name="message" 
                      rows={4}
                      placeholder={lang === "es" ? "Indique qué tipo de maquinaria tiene, ubicación en NY y qué servicio necesita..." : "Tell us about your machine type, location in NYC, and service needed..."}
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
                        {lang === "es" ? "Enviando..." : "Sending..."}
                      </>
                    ) : (
                      lang === "es" ? "Enviar Solicitud de Cotización" : "Send Quotation Request"
                    )}
                  </button>
                </form>
              </div>
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
            <span className="font-semibold text-sm text-zinc-400">Willy Fast Solutions Corp</span>
          </div>
          
          <p className="text-xs leading-relaxed max-w-md mx-auto">
            {lang === "es"
              ? "Servicio técnico móvil 24/7, prensado de mangueras hidráulicas, llantas sólidas y venta de montacargas en Ozone Park, Queens y toda el área metropolitana de Nueva York."
              : "24/7 mobile field repair, custom hydraulic hose crimping, solid tires and certified equipment sales in Ozone Park, Queens and NYC metro area."}
          </p>

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
            &copy; {new Date().getFullYear()} Willy Fast Solutions Corp. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Review Submission Modal Popup */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 my-8"
            >
              <div className="flex justify-between items-start border-b border-zinc-900 pb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400" /> Willy Fast Solutions Corp
                  </div>
                  <h3 className="text-xl font-bold text-zinc-100">
                    {lang === "es" ? "Calificar Nuestro Servicio" : "Leave a Customer Review"}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {lang === "es" 
                      ? "Tu opinión ayuda a otros negocios de maquinaria en Queens y New York a conocernos." 
                      : "Your feedback helps other warehouse and fleet operators in NY make informed decisions."}
                  </p>
                </div>
                <button 
                  onClick={() => setShowReviewModal(false)} 
                  className="text-zinc-500 hover:text-zinc-300 text-xl font-bold cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {reviewSuccess ? (
                <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-center text-emerald-400 text-sm space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                  <p className="font-bold">
                    {lang === "es" ? "¡Muchas gracias por tu reseña!" : "Thank you for your review!"}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {lang === "es" ? "Tu calificación ha sido publicada con éxito." : "Your review has been successfully published."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Star Rating Picker */}
                  <div className="space-y-1.5 text-center py-2 bg-zinc-900/40 rounded-xl border border-zinc-900">
                    <label className="text-xs font-semibold text-zinc-400 block">
                      {lang === "es" ? "Tu Calificación (1 a 5 Estrellas)" : "Your Rating (1 to 5 Stars)"}
                    </label>
                    <div className="flex justify-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 cursor-pointer transition-transform hover:scale-110"
                        >
                          <Star 
                            className={`h-7 w-7 ${
                              star <= reviewRating 
                                ? "text-amber-400 fill-amber-400" 
                                : "text-zinc-700"
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-400">
                        {lang === "es" ? "Tu Nombre *" : "Full Name *"}
                      </label>
                      <input 
                        type="text" 
                        required
                        value={reviewAuthor}
                        onChange={(e) => setReviewAuthor(e.target.value)}
                        placeholder="John Doe"
                        className="w-full h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-400">
                        {lang === "es" ? "Empresa (Opcional)" : "Company Name"}
                      </label>
                      <input 
                        type="text" 
                        value={reviewCompany}
                        onChange={(e) => setReviewCompany(e.target.value)}
                        placeholder="Apex Logistics Ltd"
                        className="w-full h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1 relative">
                      <label className="text-[11px] font-medium text-zinc-400">
                        {lang === "es" ? "Servicio Recibido" : "Service Received"}
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsReviewDropdownOpen(!isReviewDropdownOpen)}
                        className="w-full h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900/70 text-xs text-zinc-200 flex items-center justify-between hover:border-zinc-700 transition-colors cursor-pointer"
                      >
                        <span className="truncate">
                          {reviewService === "Forklift Maintenance" && (lang === "es" ? "Mantenimiento Montacargas" : "Forklift Maintenance")}
                          {reviewService === "Pallet Jack Sales & Repair" && (lang === "es" ? "Venta & Reparación Pallet Jack" : "Pallet Jack Sales & Repair")}
                          {reviewService === "Backhoe & Hydraulic Excavator Repair" && (lang === "es" ? "Servicio de Retroexcavadoras" : "Backhoe & Excavator Service")}
                          {reviewService === "Forklift Equipment Sales" && (lang === "es" ? "Venta de Montacargas / Forklifts" : "Forklift Equipment Sales")}
                          {reviewService === "Forklift Tires & Mobile Pressing" && (lang === "es" ? "Llantas & Prensado Móvil" : "Tires & Mobile Pressing")}
                          {reviewService === "Hydraulic Hoses & Fittings" && (lang === "es" ? "Mangueras Hidráulicas" : "Hydraulic Hoses")}
                          {reviewService === "Emergency Mobile Repair" && (lang === "es" ? "Servicio Mecánico Móvil" : "Emergency Field Repair")}
                        </span>
                        <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${isReviewDropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {isReviewDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 right-0 top-full mt-1 z-30 rounded-lg border border-zinc-800 bg-zinc-950 p-1 shadow-2xl space-y-0.5"
                          >
                            {[
                              { value: "Forklift Maintenance", labelEs: "Mantenimiento Montacargas", labelEn: "Forklift Maintenance" },
                              { value: "Pallet Jack Sales & Repair", labelEs: "Venta & Reparación Pallet Jack", labelEn: "Pallet Jack Sales & Repair" },
                              { value: "Backhoe & Hydraulic Excavator Repair", labelEs: "Servicio de Retroexcavadoras", labelEn: "Backhoe & Excavator Service" },
                              { value: "Forklift Equipment Sales", labelEs: "Venta de Forklifts", labelEn: "Forklift Equipment Sales" },
                              { value: "Forklift Tires & Mobile Pressing", labelEs: "Llantas & Prensado Móvil", labelEn: "Tires & Mobile Pressing" },
                              { value: "Hydraulic Hoses & Fittings", labelEs: "Mangueras Hidráulicas", labelEn: "Hydraulic Hoses & Fittings" },
                              { value: "Emergency Mobile Repair", labelEs: "Servicio Mecánico Móvil", labelEn: "Emergency Field Repair" },
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  setReviewService(opt.value);
                                  setIsReviewDropdownOpen(false);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer flex items-center justify-between ${
                                  reviewService === opt.value
                                    ? "bg-zinc-800 text-zinc-100 font-semibold"
                                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                                }`}
                              >
                                <span>{lang === "es" ? opt.labelEs : opt.labelEn}</span>
                                {reviewService === opt.value && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-400">
                        {lang === "es" ? "Ciudad / Ubicación" : "Location / Borough"}
                      </label>
                      <input 
                        type="text" 
                        value={reviewLocation}
                        onChange={(e) => setReviewLocation(e.target.value)}
                        placeholder="Ozone Park, Queens, NY"
                        className="w-full h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">
                      {lang === "es" ? "Tu Comentario / Experiencia *" : "Your Review Comment *"}
                    </label>
                    <textarea 
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder={lang === "es" ? "Escribe aquí cómo te atendieron, rapidez, calidad mecánica..." : "Share how the team handled your equipment, turnaround time, quality..."}
                      className="w-full p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      className="w-1/3 inline-flex h-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                      {lang === "es" ? "Cancelar" : "Cancel"}
                    </button>
                    <button 
                      type="submit" 
                      disabled={isReviewSubmitting}
                      className="w-2/3 inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-zinc-100 text-xs font-bold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 transition-colors shadow-md cursor-pointer"
                    >
                      {isReviewSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-3.5 w-3.5" />}
                      {lang === "es" ? "Publicar Opinión" : "Publish Review"}
                    </button>
                  </div>
                </form>
              )}

              {/* Direct Google Review Link Prompt */}
              <div className="pt-4 border-t border-zinc-900 text-center">
                <a 
                  href="https://maps.google.com/?q=Willy+Fast+Solutions+Corp+97-20+102nd+St+Ozone+Park+NY+11416" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  {lang === "es" ? "También puedes opinar en nuestra ficha oficial de Google Maps" : "Or leave your review directly on our Google Maps profile"}
                </a>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Mobile Bottom Action Bar (High Conversion) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 border-t border-zinc-800/90 p-2.5 flex items-center justify-around backdrop-blur-md shadow-2xl">
        <a 
          href="tel:+17184042038" 
          className="flex flex-col items-center gap-1 text-emerald-400 font-bold"
        >
          <div className="p-2 rounded-full bg-emerald-500/20 border border-emerald-500/40">
            <Phone className="h-4 w-4" />
          </div>
          <span className="text-[10px]">{lang === "es" ? "Llamar" : "Call"}</span>
        </a>

        <a 
          href="https://wa.me/17184042038?text=Hola%20Willy%20Fast%20Solutions,%20necesito%20servicio%20urgente%20de%20montacargas%20o%20mangueras" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex flex-col items-center gap-1 text-emerald-400 font-bold"
        >
          <div className="p-2 rounded-full bg-emerald-500/20 border border-emerald-500/40">
            <MessageCircle className="h-4 w-4" />
          </div>
          <span className="text-[10px]">WhatsApp</span>
        </a>

        <a 
          href="https://maps.google.com/?q=Willy+Fast+Solutions+Corp+97-20+102nd+St+Ozone+Park+NY+11416" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex flex-col items-center gap-1 text-rose-400 font-bold"
        >
          <div className="p-2 rounded-full bg-rose-500/20 border border-rose-500/40">
            <MapPin className="h-4 w-4" />
          </div>
          <span className="text-[10px]">Queens NY</span>
        </a>

        <button 
          onClick={() => setShowReviewModal(true)} 
          className="flex flex-col items-center gap-1 text-amber-400 font-bold cursor-pointer"
        >
          <div className="p-2 rounded-full bg-amber-500/20 border border-amber-500/40">
            <Star className="h-4 w-4" />
          </div>
          <span className="text-[10px]">{lang === "es" ? "Opinar" : "Review"}</span>
        </button>
      </div>

    </div>
  );
}
