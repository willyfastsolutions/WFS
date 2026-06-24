import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | WillyFastSolutions",
  description: "Secure B2B portal login.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
