import Hero from "@/components/Hero";
import TrendingSection from "@/components/TrendingSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent relative selection:bg-accent/30">
      <Hero />
      <TrendingSection />
    </div>
  );
}

