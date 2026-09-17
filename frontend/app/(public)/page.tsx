import Navbar from "@/components/shared/Navbar";
import Hero from "@/components/shared/Hero";
import Features from "@/components/shared/Features";
import HowItWorks from "@/components/shared/HowItWorks";
import Footer from "@/components/shared/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <Features />
        <HowItWorks />
      </main>

      <Footer />
    </>
  );
}