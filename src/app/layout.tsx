import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HEALTHGUARD | Clinical Monitoring Command Center",
  description: "Personalized Post-Discharge Deterioration Monitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F7F8F3] text-[#193B32]">
        {children}
      </body>
    </html>
  );
}
