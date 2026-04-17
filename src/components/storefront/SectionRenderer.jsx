import HeroSection from "./HeroSection";
import BannerCarousel from "./BannerCarousel";
import ImageTextBlock from "./ImageTextBlock";
import FeaturedItems from "./FeaturedItems";
import CTASection from "./CTASection";
import TestimonialsSection from "./TestimonialsSection";
import AboutSection from "./AboutSection";
import FooterSection from "./FooterSection";

const REGISTRY = {
  hero: HeroSection,
  carousel: BannerCarousel,
  imageText: ImageTextBlock,
  featured: FeaturedItems,
  cta: CTASection,
  testimonials: TestimonialsSection,
  about: AboutSection,
  footer: FooterSection,
};

export default function SectionRenderer({ section }) {
  if (!section?.enabled) return null;
  const Component = REGISTRY[section.type];
  if (!Component) return null;
  return <Component content={section.content} />;
}
