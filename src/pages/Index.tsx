import { useAppSelector } from "@/lib/hooks";
import { Dashboard } from "@/components/core/Dashboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  BookOpen,
  TestTube,
  BarChart,
  Users,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";
import { useState, useLayoutEffect, useRef } from "react";
import HeroSection from "@/components/heroSection/HeroSection";
import PricingCards from "@/components/pricingCards/PricingCards";
import Footer from "@/components/footer/Footer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnnouncementCard from "@/components/announcementCard/AnnouncementCard";
import { StudentRoute } from "@/components/auth/StudentRoute";
import { MainLayout } from "@/layouts/MainLayout";

const Index = () => {
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useLayoutEffect(() => {
    if (typeof window === "undefined" || window.innerWidth < 768) return;

    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: cardsRef.current[0],
        start: "top bottom-=100",
        toggleActions: "play none none reverse",
      },
    });

    cardsRef.current.slice(0, 4).forEach((card, index) => {
      if (card) {
        tl.fromTo(
          card,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          index * 0.2,
        );
      }
    });

    if (cardsRef.current[4]) {
      gsap.fromTo(
        cardsRef.current[4],
        { opacity: 0, x: -100 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power4.out",
          scrollTrigger: {
            trigger: cardsRef.current[4],
            start: "top bottom-=100",
            toggleActions: "play none none reverse",
          },
        },
      );
    }

    if (cardsRef.current[5]) {
      gsap.fromTo(
        cardsRef.current[5],
        { opacity: 0, x: 100 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power4.out",
          scrollTrigger: {
            trigger: cardsRef.current[5],
            start: "top bottom-=100",
            toggleActions: "play none none reverse",
          },
        },
      );
    }
  }, []);

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return (
      <MainLayout>
        <Dashboard />
      </MainLayout>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <HeroSection />

      {/* Key Features Section */}
      <section className="py-8 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold mb-4">
              Master the SBPM Exams: Your Essential Study Companion
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Target className="h-6 w-6 text-primary" />,
                title: "1,000+ Questions",
                description: "At or above exam-level difficulty",
              },
              {
                icon: <BookOpen className="h-6 w-6 text-examSecondary" />,
                title: "Expert Explanations",
                description: "In-depth, evidence-based answer explanations",
              },
              {
                icon: <TestTube className="h-6 w-6 text-examInfo" />,
                title: "Board-Simulated Interface",
                description: "Displayed in exam-like environment",
              },
              {
                icon: <Users className="h-6 w-6 text-examPrimary" />,
                title: "Expert Prepared",
                description: "By Preventive Medicine and Public Health Experts",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el;
                }}
                className="text-center border-2 hover:border-primary/20 transition-all bg-white"
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-black text-sm sm:text-base">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="inline-block bg-primary/5 rounded-lg px-6 py-3">
              <p className="text-base font-semibold text-primary">
                Comprehensive Coverage: SBPM Part 1, Promotion 1-3, and Part
                Final (2) Written Exams
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-8 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold mb-8">
              What to Expect from Your SBPM Question Bank
            </h2>
            <p className="text-sm md:text-base lg:text-lg leading-relaxed text-black">
              The SaudiKnowledgeSeeker SBPM QBank, crafted by preventive
              medicine and public health experts, is designed to save you time
              and boost your performance on the Saudi Board of Preventive
              Medicine exams. Covering the full SBPM blueprint for Part 1,
              Promotion 1, 2, 3, and Part Final (2) Written exams, our 1,000+
              practice questions offer personalized review to help you succeed
              and excel as a preventive medicine specialist.
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Learning Tools */}
      <section className="py-8 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-extrabold text-center mb-12">
            Enhanced Learning Tools to Optimize Your Study
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-center mb-12 max-w-3xl mx-auto text-black">
            Our tools provide the flexibility and efficiency needed to maximize
            your preparation around a busy schedule.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: <BookOpen className="h-8 w-8 text-primary" />,
                title: "Comprehensive Explanations",
                description:
                  "Visual, evidence-based rationales explain correct and incorrect answers, reinforcing key concepts like disease surveillance and health policy.",
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-examSecondary" />,
                title: "Progress Tracking",
                description:
                  "Monitor performance with reports to identify and remediate weaknesses.",
              },
            ].map((tool, idx) => (
              <Card
                key={idx}
                ref={(el) => {
                  if (el) cardsRef.current[4 + idx] = el;
                }}
                className="sm:p-6 bg-white"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    {tool.icon}
                    <CardTitle className="text-xl">{tool.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-black text-sm md:text-base lg:text-lg">
                    {tool.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-white">
        <PricingCards />
      </section>

      {/* Announcement Section */}
      <AnnouncementCard />

      {/* QBank Details */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-extrabold text-center mb-12">
            SaudiKnowledgeSeeker QBank Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "Part 1 QBank",
                description:
                  "Covers epidemiology, biostatistics, and health systems with detailed explanations.",
              },
              {
                title: "Promotion 1–3",
                description:
                  "Year-specific practice sets reflecting updated SBPM promotion exams.",
              },
              {
                title: "Final Part 2",
                description:
                  "Advanced-level cases and board-style questions for senior residents.",
              },
            ].map((item, i) => (
              <Card key={i} className="p-6 bg-white">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-black">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Unique Features */}
      <section className="py-8 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-extrabold text-center mb-12">
            What Makes Us Unique?
          </h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              "High-yield questions",
              "Comprehensive explanations",
              "Reliable references",
              "Progress tracking features",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-base sm:text-lg text-black">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center text-black">
            <h2 className="text-xl sm:text-2xl lg:text-4xl font-extrabold mb-6">
              Ready to Master Your SBPM Exams?
            </h2>
            <p className="text-sm sm:text-xl mb-8 opacity-90">
              Join the experts and boost your performance with our comprehensive
              question bank.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="default"
                asChild
                className="w-full sm:w-auto text-base sm:text-lg py-3 sm:py-5 px-6 sm:px-8"
              >
                <Link to="/register">Start Your Free Trial</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto text-base sm:text-lg py-3 sm:py-5 px-6 sm:px-8 border-primary text-primary"
              >
                <Link to="#pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
