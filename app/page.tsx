import Navbar from "@/components/layout/Navbar";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Hero } from "@/components/layout/Hero";
import { CustomAgentStrip } from "@/components/layout/CustomAgentStrip";
import { AgentTemplates } from "@/components/layout/AgentTemplates";
import { Features } from "@/components/layout/Features";
import { HowItWorks } from "@/components/layout/HowItWorks";
import { Pricing } from "@/components/layout/Pricing";
import { FAQ } from "@/components/layout/FAQ";
import { CTA } from "@/components/layout/CTA";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <Hero />
    
      
      
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
