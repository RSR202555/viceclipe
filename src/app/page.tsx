import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { PlatformOverview } from '@/components/landing/PlatformOverview';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { TrendRadarHighlight } from '@/components/landing/TrendRadarHighlight';
import { AIClipperHighlight } from '@/components/landing/AIClipperHighlight';
import { CommunitySection } from '@/components/landing/CommunitySection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070611] text-white flex flex-col selection:bg-vice-pink selection:text-white">
      {/* 5. Fixed Navigation Header */}
      <LandingHeader />

      <main className="flex-1 flex flex-col">
        {/* 6. Cinematic Hero Section */}
        <HeroSection />

        {/* 7. Platform Overview & Interface Composition */}
        <PlatformOverview />

        {/* 8. 4 Main Features */}
        <FeaturesSection />

        {/* 9. 4-Step Production Flow */}
        <HowItWorks />

        {/* 10. Trend Radar Highlight */}
        <TrendRadarHighlight />

        {/* 11. AI Clipper Commercial Highlight */}
        <AIClipperHighlight />

        {/* 12. Community & Creators */}
        <CommunitySection />

        {/* 13. Area de Planos (Pricing) */}
        <PricingSection />

        {/* 14. Final High-Impact CTA */}
        <FinalCTA />
      </main>

      {/* 14. Comprehensive Footer */}
      <LandingFooter />
    </div>
  );
}
