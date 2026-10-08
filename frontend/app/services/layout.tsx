import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commercial Forklift Service & Mobile Repairs | Queens NY - WFS",
  description: "24/7 emergency on-site forklift repair, mobile hydraulic hose crimping up to 6,000 PSI, pallet jack rebuilds, and solid tire pressing in Ozone Park, Queens NY.",
  alternates: {
    canonical: "https://willyfastsolutions.com/services/",
  },
  openGraph: {
    title: "Commercial Forklift Service & Mobile Repairs | Queens NY - WFS",
    description: "On-site forklift diagnostics, mobile hydraulic hose press, pallet jack pump overhauls, and routine preventive maintenance across Metro NYC.",
    url: "https://willyfastsolutions.com/services/",
    siteName: "Willy Fast Solutions Corp",
    images: [{ url: "https://willyfastsolutions.com/logo/logo.png", width: 512, height: 512, alt: "WFS Services" }],
    locale: "en_US",
    type: "website",
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
