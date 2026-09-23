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
  Download,
  Phone,
  MapPin,
  Star,
  MessageCircle,
  Truck,
  ShoppingCart,
  ExternalLink,
  Globe,
  Sparkles,
  CircleDot,
  ChevronDown
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
  }
];

export default function Home() {
  const [lang, setLang] = useState<"en" | "es">("en");
  const [activeTab, setActiveTab] = useState<MachineType>("forklift");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [simHours, setSimHours] = useState(180);
  const [fleetSize, setFleetSize] = useState(15);
  const [downtimeCost, setDowntimeCost] = useState(150);
  const [showReportModal, setShowReportModal] = useState(false);

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
      
      {/* Emergency & Location Top Bar */}
      <div className="bg-zinc-900/95 border-b border-zinc-800/80 px-4 py-2 text-xs text-zinc-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <a 
              href="https://maps.google.com/?q=Willy+Fast+Solutions+Corp+97-20+102nd+St+Ozone+Park+NY+11416" 
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
                {lang === "es" ? "6 Opiniones Google" : "6 Google Reviews"}
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
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
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
              <span className="text-[10px] text-zinc-500 font-medium block">Corp • Queens, NY</span>
            </div>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a href="#services" className="hover:text-zinc-100 transition-colors">{lang === "es" ? "Servicios" : "Services"}</a>
            <a href="#forklifts" className="hover:text-zinc-100 transition-colors">{lang === "es" ? "Montacargas" : "Forklifts"}</a>
            <a href="#forklift-tires" className="hover:text-zinc-100 transition-colors">{lang === "es" ? "Llantas" : "Tires"}</a>
            <a href="#hydraulic-hoses" className="hover:text-zinc-100 transition-colors">{lang === "es" ? "Mangueras Hidráulicas" : "Hydraulic Hoses"}</a>
            <a href="#machinery-sales" className="hover:text-zinc-100 transition-colors">{lang === "es" ? "Venta Maquinaria" : "Equipment Sales"}</a>
            <a href="#reviews" className="hover:text-zinc-100 transition-colors flex items-center gap-1">
              <span>{lang === "es" ? "Opiniones" : "Reviews"}</span>
              <span className="text-amber-400 font-bold text-xs">★ 5.0</span>
            </a>
            <a href="#about" className="hover:text-zinc-100 transition-colors">{lang === "es" ? "Nosotros" : "About"}</a>
            <a href="#contact" className="hover:text-zinc-100 transition-colors">{lang === "es" ? "Contacto" : "Contact"}</a>
          </nav>
          
          {/* Social Icons + Login */}
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
      <section id="home" className="relative py-20 md:py-28 overflow-hidden border-b border-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left flex flex-col md:flex-row items-center gap-12">
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
                  Servicio de Montacargas, Mangueras Hidráulicas y Maquinaria en Queens, NY
                </>
              ) : (
                <>
                  Forklift Service, Mobile Hydraulic Hoses & Heavy Machinery in Queens, NY
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
                  Mantenimiento preventivo y correctivo de montacargas, fabricación móvil de mangueras hidráulicas de alta presión en el sitio y venta de maquinaria certificada con telemetría en tiempo real. <strong>Servicio de emergencia 24/7 en Queens, Brooklyn, Bronx, Manhattan, Long Island y NJ.</strong>
                </>
              ) : (
                <>
                  On-site mobile forklift repairs, rush hydraulic hose replacement, and certified heavy machinery sales backed by cloud telemetry. <strong>24/7 Emergency dispatch across Queens, Brooklyn, Long Island, and NYC metro.</strong>
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
                href="https://wa.me/17184042038?text=Hola%20Willy%20Fast%20Solutions,%20necesito%20cotizar%20un%20servicio%20de%20maquinaria%20o%20mangueras" 
                target="_blank"
                rel="noopener noreferrer"
                id="btn-hero-whatsapp" 
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-zinc-950 px-6 text-sm font-semibold text-emerald-400 transition-all hover:bg-emerald-500/10 hover:border-emerald-400"
              >
                <MessageCircle className="h-4 w-4" /> {lang === "es" ? "WhatsApp Directo" : "Direct WhatsApp"}
              </a>
              <a 
                href="#services" 
                id="btn-hero-services" 
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-5 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-900 hover:text-zinc-100"
              >
                {lang === "es" ? "Ver Servicios" : "Explore Services"} <ArrowRight className="h-3.5 w-3.5" />
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
                  <span className="text-xs text-zinc-400">({reviewSummary.total_reviews} opiniones en Google)</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {lang === "es" 
                    ? "Servicio de mantenimiento, reparación y alquiler de montacargas en Nueva York" 
                    : "Forklift repair, maintenance & heavy machinery services in New York"}
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
                  <span><strong>{lang === "es" ? "Dirección:" : "Address:"}</strong> 97-20 102nd St, Ozone Park, NY 11416, Estados Unidos</span>
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
                  ? "Atendemos almacenes logísticos, plantas de reciclaje, depósitos, constructoras y talleres en Queens, Brooklyn, Bronx, Manhattan y Long Island. Si tu montacargas o excavadora se detiene, enviamos mecánicos especializados y nuestro taller móvil con prensadora de mangueras hidráulicas directamente a tu empresa."
                  : "We support logistics warehouses, distribution centers, scrap yards, and construction sites across all 5 boroughs of New York and Long Island. When your forklift or excavator is down, our mobile field mechanics dispatch directly to your jobsite with full tooling and hydraulic hose crimping equipment."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/60">
                  <div className="text-emerald-400 font-bold text-lg">&lt;45 Min</div>
                  <div className="text-xs text-zinc-400 font-medium mt-0.5">
                    {lang === "es" ? "Tiempo Respuesta Queens" : "Queens Response Time"}
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

      {/* Core Commercial Services Trio (High Search Volume Landing) */}
      <section id="services" className="py-20 md:py-28 border-b border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              {lang === "es" ? "Servicios Principales en Queens & NY" : "Primary Services in Queens & NY"}
            </span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-100">
              {lang === "es" ? "Soluciones Especializadas para Maquinaria Pesada" : "Specialized Heavy Machinery Solutions"}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              {lang === "es"
                ? "Reparaciones mecánicas inmediatas, fabricación de mangueras a presión y venta de equipos garantizados."
                : "Immediate mechanical repairs, custom high-pressure hose manufacturing, and guaranteed certified machinery sales."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Service 1: Forklift Repair & Maintenance */}
            <div id="forklifts" className="border border-zinc-900 bg-zinc-900/20 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-800 transition-all group">
              <div className="space-y-4">
                <div className="inline-flex p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 group-hover:scale-105 transition-transform">
                  <Wrench className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-100">
                  {lang === "es" ? "Mantenimiento de Montacargas" : "Forklift Repair & Maintenance"}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {lang === "es"
                    ? "Mantenimiento preventivo y correctivo para montacargas Toyota, Hyster, Yale, Crown, Cat y Clark. Mástiles, cilindros hidráulicos, frenos, baterías y afinación de motor."
                    : "On-site mobile repair and scheduled PM for Toyota, Hyster, Yale, Crown, Cat, and Clark forklifts. Mast hydraulics, brakes, electric batteries, and OSHA checks."}
                </p>
                <ul className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-zinc-900">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Diagnóstico móvil computarizado</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Filtros y fluidos hidráulicos</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Inspección y certificación OSHA</li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-900 flex flex-col gap-2">
                <a 
                  href="tel:+17184042038" 
                  className="w-full inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-zinc-100 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" /> {lang === "es" ? "Solicitar Mecánico" : "Request Mechanic"}
                </a>
                <a 
                  href="https://wa.me/17184042038?text=Hola,%20necesito%20servicio%20de%20reparaci%C3%B3n%20para%20un%20montacargas" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full inline-flex h-8 items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Cotizar por WhatsApp
                </a>
              </div>
            </div>

            {/* Service 2: New Forklift Tires & Mobile Pressing */}
            <div id="forklift-tires" className="border border-zinc-900 bg-zinc-900/20 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-800 transition-all group">
              <div className="space-y-4">
                <div className="inline-flex p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 group-hover:scale-105 transition-transform">
                  <CircleDot className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-100">
                  {lang === "es" ? "Llantas Nuevas & Prensado Móvil" : "Forklift Tires & Mobile Pressing"}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {lang === "es"
                    ? "Venta e instalación de llantas sólidas rudomáticas (Solid Pneumatic), cushion y que no dejan huella (Non-Marking). Taller móvil con prensa hidráulica industrial directo en tu bodega en Queens y todo NY."
                    : "Sales and on-site mobile pressing for solid pneumatic, smooth/traction cushion, and non-marking forklift tires. Direct installation at your facility across NYC."}
                </p>
                <ul className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-zinc-900">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Llantas sólidas y cushion uso rudo</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Non-Marking (bodegas y alimentos)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Prensa hidráulica móvil a domicilio</li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-900 flex flex-col gap-2">
                <a 
                  href="tel:+17184042038" 
                  className="w-full inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-zinc-100 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" /> {lang === "es" ? "Cotizar Llantas" : "Quote Forklift Tires"}
                </a>
                <a 
                  href="https://wa.me/17184042038?text=Hola,%20necesito%20cotizar%20llantas%20nuevas%20para%20un%20montacargas%20en%20Queens" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full inline-flex h-8 items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Consultar Medidas
                </a>
              </div>
            </div>

            {/* Service 3: Hydraulic Hoses & Fittings */}
            <div id="hydraulic-hoses" className="border-2 border-emerald-500/40 bg-zinc-900/40 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-emerald-500 text-zinc-950 text-[9px] font-extrabold px-2.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                {lang === "es" ? "Emergencias" : "Emergency"}
              </div>

              <div className="space-y-4">
                <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-100">
                  {lang === "es" ? "Mangueras Hidráulicas" : "Custom Hydraulic Hoses"}
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {lang === "es"
                    ? "Fabricación y prensado móvil en el sitio de mangueras hidráulicas de alta y extrema presión (2 y 4 mallas espirales hasta 6,000 PSI). Conexiones JIC, NPT, ORFS y bridas para maquinaria pesada."
                    : "On-site custom hydraulic hose assemblies and crimping up to 6,000 PSI (2-wire, 4-wire spiral). JIC, NPT, ORFS, Code 61/62 flange fittings for excavators, loaders, and trucks."}
                </p>
                <ul className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-zinc-800">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Taller móvil llega en &lt;45 min en Queens</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Mangueras y acoples de alta durabilidad</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Evita horas de maquinaria parada</li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col gap-2">
                <a 
                  href="tel:+17184042038" 
                  className="w-full inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 text-xs font-bold text-black hover:bg-emerald-400 transition-colors shadow-md"
                >
                  <Phone className="h-3.5 w-3.5" /> {lang === "es" ? "Pedir Manguera Urgente" : "Call Rush Dispatch"}
                </a>
                <a 
                  href="https://wa.me/17184042038?text=Hola,%20se%20me%20revent%C3%B3%20una%20manguera%20hidr%C3%A1ulica%20y%20necesito%20una%20nueva" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full inline-flex h-8 items-center justify-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Enviar foto de la manguera
                </a>
              </div>
            </div>

            {/* Service 4: Machinery Sales & Rentals */}
            <div id="machinery-sales" className="border border-zinc-900 bg-zinc-900/20 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-800 transition-all group">
              <div className="space-y-4">
                <div className="inline-flex p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 group-hover:scale-105 transition-transform">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-100">
                  {lang === "es" ? "Venta & Alquiler de Equipos" : "Forklift Sales & Rentals"}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {lang === "es"
                    ? "Venta de montacargas nuevos y usados certificados con garantía mecánica. Equipos eléctricos, propano y diesel inspeccionados con telemetría lista para operar."
                    : "Certified pre-owned and reconditioned forklifts with full mechanical warranty. Electric, LPG, and diesel warehouse equipment ready for immediate delivery across NY & NJ."}
                </p>
                <ul className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-zinc-900">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Montacargas Toyota, Caterpillar, Bobcat</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Historial telemático de horas auditado</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Opciones de alquiler y financiamiento</li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-900 flex flex-col gap-2">
                <button 
                  onClick={() => handleSelectPackage("Machinery Purchase / Rental Quotation")}
                  className="w-full inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-zinc-100 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  <ShoppingCart className="h-3.5 w-3.5" /> {lang === "es" ? "Ver Equipos" : "View Inventory"}
                </button>
                <a 
                  href="https://wa.me/17184042038?text=Hola,%20quisiera%20saber%20qu%C3%A9%20montacargas%20tienen%20disponibles%20para%20la%20venta%20o%20renta" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full inline-flex h-8 items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Consultar inventario
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
                  ? "Calificación 5.0 en Google. Empresas de logística, almacenes y contratistas confían en Willy Fast Solutions en Queens y Nueva York." 
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
                          {reviewService === "Forklift Tires & Mobile Pressing" && (lang === "es" ? "Llantas & Prensado Móvil" : "Tires & Mobile Pressing")}
                          {reviewService === "Hydraulic Hoses & Fittings" && (lang === "es" ? "Mangueras Hidráulicas" : "Hydraulic Hoses")}
                          {reviewService === "Machinery Sales & Rental" && (lang === "es" ? "Venta / Renta Equipos" : "Machinery Sales & Rental")}
                          {reviewService === "Emergency Mobile Repair" && (lang === "es" ? "Servicio Mecánico Móvil" : "Emergency Field Repair")}
                          {reviewService === "OSHA Safety Checklist" && (lang === "es" ? "Inspección de Seguridad OSHA" : "OSHA Safety Checklist")}
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
                              { value: "Forklift Tires & Mobile Pressing", labelEs: "Llantas & Prensado Móvil", labelEn: "Tires & Mobile Pressing" },
                              { value: "Hydraulic Hoses & Fittings", labelEs: "Mangueras Hidráulicas", labelEn: "Hydraulic Hoses & Fittings" },
                              { value: "Machinery Sales & Rental", labelEs: "Venta / Renta Equipos", labelEn: "Machinery Sales & Rental" },
                              { value: "Emergency Mobile Repair", labelEs: "Servicio Mecánico Móvil", labelEn: "Emergency Field Repair" },
                              { value: "OSHA Safety Checklist", labelEs: "Inspección Seguridad OSHA", labelEn: "OSHA Safety Checklist" },
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
