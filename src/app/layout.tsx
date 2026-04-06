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
  title: "WIGO — Trouvez Hôtels, Vols & Activités avec l'IA",
  description: "WIGO est votre compagnon de voyage IA. Recherchez hôtels, vols, activités, transferts aéroport et points d'intérêt en Europe. Powered by Amadeus.",
  keywords: ["hôtel", "vol", "voyage", "IA", "Amadeus", "Europe", "Belgique", "France", "activités", "randonnée", "comparateur", "pas cher"],
  openGraph: {
    title: "WIGO — Voyagez plus intelligent avec l'IA",
    description: "Trouvez hôtels, vols et activités en Europe grâce à l'intelligence artificielle. Recherche en langage naturel, prix en temps réel.",
    url: "https://nomadic-henna.vercel.app",
    siteName: "WIGO",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WIGO — Voyagez plus intelligent",
    description: "Hôtels, vols et activités trouvés par IA. Prix réels Amadeus.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <head>
          <script
            data-noptimize="1"
            data-cfasync="false"
            data-wpfc-render="false"
            dangerouslySetInnerHTML={{
              __html: `(function () { var script = document.createElement("script"); script.async = 1; script.src = 'https://tpembars.com/NTA4OTY1.js?t=508965'; document.head.appendChild(script); })();`,
            }}
          />
        </head>
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