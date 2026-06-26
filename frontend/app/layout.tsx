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
  title: "Preventive Maintenance & Fleet Management | WillyFastSolutions",
  description: "Maximize heavy machinery uptime. WillyFastSolutions automates hour logging, safety checklists, and preventive maintenance audits for B2B fleets.",
  keywords: ["forklift maintenance", "skid steer loader maintenance", "excavator service", "heavy equipment maintenance", "WillyFastSolutions", "telemetry hour logging"],
  alternates: {
    canonical: "https://willyfastsolutions.com/",
  },
  openGraph: {
    title: "Preventive Maintenance & Fleet Management | WillyFastSolutions",
    description: "Maximize heavy machinery uptime. WillyFastSolutions automates hour logging, safety checklists, and preventive maintenance audits for B2B fleets.",
    url: "https://willyfastsolutions.com/",
    siteName: "WillyFastSolutions",
    images: [
      {
        url: "https://willyfastsolutions.com/logo/logo.png",
        width: 512,
        height: 512,
        alt: "WillyFastSolutions Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Preventive Maintenance & Fleet Management | WillyFastSolutions",
    description: "Maximize heavy machinery uptime. WillyFastSolutions automates hour logging, safety checklists, and preventive maintenance audits for B2B fleets.",
    images: ["https://willyfastsolutions.com/logo/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta
          http-equiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' http://localhost:8000 https://willyfastsolutions.com https://www.willyfastsolutions.com;"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "WillyFastSolutions",
              "url": "https://willyfastsolutions.com",
              "logo": "https://willyfastsolutions.com/logo/logo.png",
              "description": "Maximize heavy machinery uptime. WillyFastSolutions automates hour logging, safety checklists, and preventive maintenance audits for B2B fleets.",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "email": "info@willyfastsolutions.com"
              }
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
