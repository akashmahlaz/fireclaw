import Navbar from "@/components/layout/Navbar";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Hero } from "@/components/layout/Hero";
import { TerminalShowcase } from "@/components/layout/TerminalShowcase";
import { VideoShowcase } from "@/components/layout/VideoShowcase";
import { ChannelOrbit } from "@/components/layout/ChannelOrbit";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <TerminalShowcase />
      <VideoShowcase />
      <ChannelOrbit />
    </>
  );
}
