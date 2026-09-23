import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Willy Fast Solutions Corp | Forklift Service, Tires & Hydraulic Hoses in Queens, NY",
  description: "Servicio y llantas para montacargas, reparación de mangueras hidráulicas y maquinaria pesada en Queens, NY. Top-rated forklift tires, mobile pressing, hydraulic hose repair, and maintenance in New York. Call +1 (718) 404-2038.",
  keywords: [
    "forklift service queens new york",
    "servicio de forklift queens new york",
    "llantas para montacargas new york",
    "forklift tires queens ny",
    "solid forklift tires replacement",
    "cushion tires forklift queens",
    "mobile forklift tire pressing ny",
    "llantas solidas para montacargas queens",
    "mantenimiento de montacargas new york",
    "reparacion de montacargas queens",
    "forklift repair queens ny",
    "forklift maintenance ozone park ny",
    "venta de mangueras hidraulicas para maquinaria pesada",
    "mangueras hidraulicas queens ny",
    "hydraulic hoses heavy equipment new york",
    "emergency mobile hydraulic hose repair",
    "venta de montacargas new york",
    "used forklifts for sale queens",
    "Willy Fast Solutions Corp",
    "heavy machinery maintenance nyc"
  ],
  authors: [{ name: "Willy Fast Solutions Corp", url: "https://willyfastsolutions.com" }],
  creator: "Willy Fast Solutions Corp",
  publisher: "Willy Fast Solutions Corp",
  alternates: {
    canonical: "https://willyfastsolutions.com/",
    languages: {
      "en-US": "https://willyfastsolutions.com/",
      "es-US": "https://willyfastsolutions.com/",
    },
  },
  other: {
    "geo.region": "US-NY",
    "geo.placename": "Queens, Ozone Park, New York",
    "geo.position": "40.6865;-73.8443",
    "ICBM": "40.6865, -73.8443",
    "telephone": "+1-718-404-2038",
  },
  openGraph: {
    title: "Willy Fast Solutions Corp | Forklift Service & Hydraulic Hoses in Queens, NY",
    description: "Servicio de montacargas, mangueras hidráulicas para maquinaria pesada y venta de equipos en Queens, NY. Rated 5.0 ★★★★★ on Google. Call +1 (718) 404-2038.",
    url: "https://willyfastsolutions.com/",
    siteName: "Willy Fast Solutions Corp",
    images: [
      {
        url: "https://willyfastsolutions.com/logo/logo.png",
        width: 512,
        height: 512,
        alt: "Willy Fast Solutions Corp Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Willy Fast Solutions Corp | Forklift Service & Hydraulic Hoses in Queens, NY",
    description: "Forklift maintenance, custom hydraulic hoses, and machinery sales in Queens, NY. Call +1 (718) 404-2038.",
    images: ["https://willyfastsolutions.com/logo/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "AutoRepair", "HomeAndConstructionBusiness"],
    "@id": "https://willyfastsolutions.com/#localbusiness",
    "name": "Willy Fast Solutions Corp",
    "alternateName": ["WillyFastSolutions", "Willy Fast Solutions Montacargas NY"],
    "url": "https://willyfastsolutions.com",
    "logo": "https://willyfastsolutions.com/logo/logo.png",
    "image": "https://willyfastsolutions.com/logo/logo.png",
    "telephone": "+1-718-404-2038",
    "email": "info@willyfastsolutions.com",
    "priceRange": "$$",
    "currenciesAccepted": "USD",
    "paymentAccepted": "Cash, Credit Card, Zelle, Check, Wire Transfer",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "97-20 102nd St",
      "addressLocality": "Ozone Park",
      "addressRegion": "NY",
      "postalCode": "11416",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 40.6865,
      "longitude": -73.8443
    },
    "hasMap": "https://maps.google.com/?q=Willy+Fast+Solutions+Corp+97-20+102nd+St+Ozone+Park+NY+11416",
    "areaServed": [
      { "@type": "City", "name": "Queens" },
      { "@type": "City", "name": "Ozone Park" },
      { "@type": "City", "name": "Brooklyn" },
      { "@type": "City", "name": "Long Island City" },
      { "@type": "City", "name": "Jamaica" },
      { "@type": "City", "name": "Flushing" },
      { "@type": "City", "name": "Astoria" },
      { "@type": "City", "name": "Bronx" },
      { "@type": "City", "name": "Manhattan" },
      { "@type": "City", "name": "Staten Island" },
      { "@type": "AdministrativeArea", "name": "Long Island" },
      { "@type": "AdministrativeArea", "name": "New York" },
      { "@type": "AdministrativeArea", "name": "New Jersey" }
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "07:00",
        "closes": "19:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Sunday"],
        "opens": "08:00",
        "closes": "17:00"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "48",
      "reviewCount": "48"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Heavy Machinery & Maintenance Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Forklift Preventive Maintenance & Mobile Repair Service",
            "description": "On-site forklift repair, mast alignment, hydraulic check, brake service, battery maintenance, and OSHA inspections in Queens, Brooklyn, and NY."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Custom Hydraulic Hose Fabrication & Emergency Replacement",
            "description": "Mobile high-pressure hydraulic hose crimping and on-site fitting replacement for excavators, skid steers, forklifts, and heavy equipment."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Forklift & Heavy Equipment Sales & Rental",
            "description": "Certified pre-owned and new forklifts, skid steer loaders, and hydraulic attachments with telemetry warranties."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "New Forklift Tires, Mobile Pressing & Installation Service",
            "description": "Solid pneumatic tires, cushion smooth/traction tires, non-marking warehouse tires, and on-site mobile hydraulic tire pressing in Queens, Brooklyn, and NY."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Automated Fleet Telemetry & Hour Meter Audits",
            "description": "24/7 cloud logging of machine operating hours with automated PDF compliance reports sent to fleet supervisors."
          }
        }
      ]
    },
    "review": [
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Carlos Mendez" },
        "datePublished": "2026-08-10",
        "reviewBody": "Excelente servicio. Se nos reventó una manguera hidráulica en un forklift Toyota y Willy llegó en 40 minutos a prensar la manguera nueva. 100% recomendado en Queens.",
        "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }
      },
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Robert Kowalski" },
        "datePublished": "2026-08-18",
        "reviewBody": "Best forklift maintenance service in New York. They handle routine PM checks for our 4 Bobcat skid steers and Caterpillar excavator.",
        "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }
      },
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "David Rodriguez" },
        "datePublished": "2026-08-25",
        "reviewBody": "Compramos un montacargas Toyota certificado con Willy Fast Solutions y el equipo vino impecable. Gran honestidad y profesionalismo.",
        "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }
      }
    ]
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema)
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
