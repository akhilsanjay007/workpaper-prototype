import { IBM_Plex_Sans } from "next/font/google";
import type { Metadata } from "next";
import { Header } from "@/components/header";
import { getDemoStaff, getDiagnostics } from "@/lib/packet";
import { WorkpaperProvider } from "@/lib/workpaper-store";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Okafor-Lindqvist 2025",
  description: "MiraFlores tax workpaper prototype",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.className} bg-slate-50 text-slate-900 antialiased`}>
        <WorkpaperProvider
          staff={getDemoStaff()}
          warningCodes={getDiagnostics()
            .filter((item) => item.severity === "warning")
            .map((item) => item.code)}
        >
          <Header />
          <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        </WorkpaperProvider>
      </body>
    </html>
  );
}
