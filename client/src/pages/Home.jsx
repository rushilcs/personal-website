import { useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { ReasoningSection } from "../components/ReasoningSection";
import { ConceptsPortfolio } from "../components/ConceptsPortfolio";
import { WorkLedgerSection } from "../components/WorkLedgerSection";
import { AboutRushilSection } from "../components/AboutRushilSection";
import { ContactSection } from "../components/ContactSection";
import { Chatbot } from "../components/Chatbot";

export const Home = () => {
  // Disable browser scroll restoration and scroll to top on page load/refresh
  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    // Scroll to top immediately and after a small delay to override any browser restoration
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    
    // Also scroll after a brief delay to ensure it overrides browser restoration
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <Navbar />
      
      {/* Main Content */}
      <main>
        <HeroSection />
        <ReasoningSection />
        <ConceptsPortfolio />
        <WorkLedgerSection />
        <AboutRushilSection />
        <ContactSection />
      </main>
      
      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};
