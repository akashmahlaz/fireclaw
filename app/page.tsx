import Navbar from "@/components/layout/Navbar";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Hero } from "@/components/layout/Hero";
import { Features } from "@/components/layout/Features";
import { Pricing } from "@/components/layout/Pricing";
import { HowItWorks } from "@/components/layout/HowItWorks";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Footer />
    </>
  );
}
