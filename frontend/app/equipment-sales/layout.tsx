import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certified Pre-Owned Forklifts for Sale | Queens NY - WFS",
  description: "Inspected pre-owned Toyota, Crown, and Hyster forklifts for sale in Ozone Park, Queens NY. Multi-point certified units with mechanical warranty. Inquire today.",
  alternates: {
    canonical: "https://willyfastsolutions.com/equipment-sales/",
  },
  openGraph: {
    title: "Certified Pre-Owned Forklifts for Sale | Queens NY - WFS",
    description: "Browse certified pre-owned Toyota, Crown, and Hyster forklifts ready for delivery in Queens and Metro NY. Backed by WFS mechanical warranty.",
    url: "https://willyfastsolutions.com/equipment-sales/",
    siteName: "Willy Fast Solutions Corp",
    images: [{ url: "https://willyfastsolutions.com/logo/logo.png", width: 512, height: 512, alt: "WFS Forklift Sales" }],
    locale: "en_US",
    type: "website",
  },
};

export default function EquipmentSalesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
