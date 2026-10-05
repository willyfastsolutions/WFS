import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fleet Maintenance Software & Telemetry | Willy Fast Solutions",
  description: "Autonomous heavy machinery telemetry, horometer tracking, automated OSHA audit checklists, and fleet downtime ROI calculator for warehouse and contractor equipment.",
  alternates: {
    canonical: "https://willyfastsolutions.com/software/",
  },
  openGraph: {
    title: "Fleet Maintenance Software & Telemetry | Willy Fast Solutions",
    description: "Autonomous heavy machinery telemetry, horometer tracking, and automated OSHA compliance audit reports for forklift and excavator fleets.",
    url: "https://willyfastsolutions.com/software/",
    siteName: "Willy Fast Solutions Corp",
    images: [
      {
        url: "https://willyfastsolutions.com/logo/logo.png",
        width: 512,
        height: 512,
        alt: "WFS Fleet Software Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function SoftwareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
