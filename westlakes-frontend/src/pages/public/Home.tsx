import CtaSection from "@/components/home/CtaSection"
import HeroSection from "@/components/home/HeroSection"
import MobileBankingSection from "@/components/home/MobileBankingSection"
import ServicesSection from "@/components/home/ServicesSection"
import StatisticsSection from "@/components/home/StatisticsSection"
import TestimonialsSection from "@/components/home/TestimonialsSection"
import WhyChooseUsSection from "@/components/home/WhyChooseUsSection"

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <WhyChooseUsSection />
      <MobileBankingSection />
      <TestimonialsSection />
      <StatisticsSection />
      <CtaSection />
    </>
  )
}
