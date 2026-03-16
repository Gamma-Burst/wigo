import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import AIChat from "@/components/AIChat";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "WIGO — Hôtels, Randonnées & Loisirs en Europe",
  description: "Trouvez hôtels, randonnées, châteaux, événements et activités en Europe grâce à l'IA. Votre compagnon de voyage intelligent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
          <AIChat />
        </body>
      </html>
    </ClerkProvider>
  );
}

