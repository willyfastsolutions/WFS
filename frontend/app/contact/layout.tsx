import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Map & Operating Hours | Forklift Facility in Ozone Park, Queens NY - WFS",
  description: "Visit our shop at 97-20 102nd St, Ozone Park, Queens NY 11416. Operating hours: Mon-Sat 7am-6pm. 24/7 mobile field dispatch across Metro NY. Call (718) 404-2038.",
  alternates: {
    canonical: "https://willyfastsolutions.com/contact/",
  },
  openGraph: {
    title: "Map & Operating Hours | Forklift Facility in Ozone Park, Queens NY - WFS",
    description: "Physical depot address, map directions, and operating hours for Willy Fast Solutions Corp in Ozone Park, Queens NY. 24/7 rapid mobile emergency service.",
    url: "https://willyfastsolutions.com/contact/",
    siteName: "Willy Fast Solutions Corp",
    images: [{ url: "https://willyfastsolutions.com/logo/logo.png", width: 512, height: 512, alt: "WFS Map and Hours" }],
    locale: "en_US",
    type: "website",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
