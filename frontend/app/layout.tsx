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
  alternates: {
    canonical: "https://willyfastsolutions.com/",
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
