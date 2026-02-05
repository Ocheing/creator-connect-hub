import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import HowItWorks from "@/components/home/HowItWorks";
import WhyMicroInfluencers from "@/components/home/WhyMicroInfluencers";
import ServicesPreview from "@/components/home/ServicesPreview";
import Testimonials from "@/components/home/Testimonials";
import EmailSignup from "@/components/home/EmailSignup";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <HowItWorks />
      <WhyMicroInfluencers />
      <ServicesPreview />
      <Testimonials />
      <EmailSignup />
    </Layout>
  );
};

export default Index;
