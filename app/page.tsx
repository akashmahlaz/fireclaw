import Navbar from "@/components/layout/Navbar";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Hero } from "@/components/layout/Hero";
import { QuietStatement } from "@/components/layout/QuietStatement";
import { Comparison } from "@/components/layout/Comparison";
import { HowItWorks } from "@/components/layout/HowItWorks";
import { UseCases } from "@/components/layout/UseCases";
import { PullQuote } from "@/components/layout/PullQuote";
import { BusinessPricing } from "@/components/layout/BusinessPricing";
import { FAQ } from "@/components/layout/FAQ";
import { CTA } from "@/components/layout/CTA";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <QuietStatement />
      <Comparison />
      <HowItWorks />
      <UseCases />
      <PullQuote />
      <BusinessPricing />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
