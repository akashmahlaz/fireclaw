import Navbar from "@/components/layout/Navbar";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Hero } from "@/components/layout/Hero";
import { CTA } from "@/components/layout/CTA";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <CTA />
      <Footer />
    </>
  );
}
