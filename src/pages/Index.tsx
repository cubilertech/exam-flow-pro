
import { useAppSelector } from "@/lib/hooks";
import { Dashboard } from "@/components/core/Dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { BookOpen, TestTube, BarChart, Users, CheckCircle, Clock, Target, TrendingUp, Globe, Shield } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState, useEffect, useRef } from "react";
import HeroSection from "@/components/heroSection/HeroSection";
import PricingCards from "@/components/pricingCards/PricingCards";
import Footer from "@/components/footer/Footer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnnouncementCard from "@/components/announcementCard/AnnouncementCard";

const Index = () => {
  const cardsRef = useRef([]);

  useEffect(() => {

    if (window.innerWidth < 768) return; // Skip animations on small screens

    gsap.registerPlugin(ScrollTrigger);

    // Animate the first 4 cards (from bottom)
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: cardsRef.current[0],
        start: "top bottom-=100",
        toggleActions: "play none none reverse",
        markers: false,
      },
    });

    // Animate each of the first 4 cards from below
    cardsRef.current.slice(0, 4).forEach((card, index) => {
      tl.fromTo(
        card,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        index * 0.2
      );
    });

    // Animate left-to-right card (index 4)
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
            markers: false,
          },
        }
      );
    }

    // Animate right-to-left card (index 5)
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
            markers: false,
          },
        }
      );
    }
  }, []);

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  // const [selectedDuration, setSelectedDuration] = useState("3");

  const pricingData = {
    "3": {
      part1: { price: "783 SAR", duration: "3 months" },
      promotion: { price: "888 SAR", duration: "3 months" },
      final: { price: "983 SAR", duration: "3 months" }
    },
    "6": {
      part1: { price: "883 SAR", duration: "6 months" },
      promotion: { price: "988 SAR", duration: "6 months" },
      final: { price: "1083 SAR", duration: "6 months" }
    },
    "12": {
      part1: { price: "1083 SAR", duration: "12 months" },
      promotion: { price: "1188 SAR", duration: "12 months" },
      final: { price: "1283 SAR", duration: "12 months" }
    }
  };

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Key Features */}
      <div className="py-8 sm:py-16  bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold sm:font-bold mb-4">
              Master the SBPM Exams: Your Essential Study Companion
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card
              ref={el => cardsRef.current[0] = el}
              className="text-center border-2 hover:border-primary/20 transition-all">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">1,000+ Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className=" text-muted-foreground text-sm sm:text-base">At or above exam-level difficulty</p>
              </CardContent>
            </Card>

            <Card
              ref={el => cardsRef.current[1] = el}
              className="text-center border-2 hover:border-primary/20 transition-all">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-examSecondary/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-examSecondary" />
                </div>
                <CardTitle className="text-lg">Expert Explanations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm sm:text-base">In-depth, evidence-based answer explanations</p>
              </CardContent>
            </Card>

            <Card
              ref={el => cardsRef.current[2] = el}
              className="text-center border-2 hover:border-primary/20 transition-all">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-examInfo/10 flex items-center justify-center mx-auto mb-4">
                  <TestTube className="h-6 w-6 text-examInfo" />
                </div>
                <CardTitle className="text-lg">Board-Simulated Interface</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm sm:text-base">Displayed in exam-like environment</p>
              </CardContent>
            </Card>

            <Card
              ref={el => cardsRef.current[3] = el}
              className="text-center border-2 hover:border-primary/20 transition-all">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-examPrimary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-examPrimary" />
                </div>
                <CardTitle className="text-lg">Expert Prepared</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm sm:text-base">By Preventive Medicine and Public Health Experts</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <div className="inline-block bg-primary/5  rounded-lg px-6 py-3">
              <p className="text-base font-semibold text-primary">
                Comprehensive Coverage: SBPM Part 1, Promotion 1-3, and Part Final (2) Written Exams
              </p>
            </div>
          </div>


        </div>
      </div>

      {/* What to Expect */}
      <div className="py-8 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl  md:text-3xl lg:text-4xl font-extrabold sm:font-bold text-center mb-8">
              What to Expect from Your SBPM Question Bank
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-muted-foreground text-center mb-12 leading-relaxed">
              The SaudiKnowledgeSeeker SBPM QBank, crafted by preventive medicine and public health experts,
              is designed to save you time and boost your performance on the Saudi Board of Preventive Medicine exams.
              Covering the full SBPM blueprint for Part 1, Promotion 1, 2, 3, and Part Final (2) Written exams,
              our 1,000+ practice questions offer personalized review to help you succeed and excel as a preventive medicine specialist.
            </p>
          </div>
        </div>
      </div>
    

      {/* Enhanced Learning Tools */}
      <div className="py-8 sm:py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold sm:font-bold text-center mb-12">
            Enhanced Learning Tools to Optimize Your Study
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            Our tools provide the flexibility and efficiency needed to maximize your preparation around a busy schedule.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card  ref={el => cardsRef.current[4] = el} className="sm:p-6">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <CardTitle className="text-xl">Comprehensive Explanations</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm md:text-base lg:text-lg">
                  Visual, evidence-based rationales explain correct and incorrect answers,
                  reinforcing key concepts like disease surveillance and health policy.
                </p>
              </CardContent>
            </Card>

            <Card ref={el => cardsRef.current[5] = el} className="sm:p-6">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-examSecondary" />
                  <CardTitle className="text-xl">Progress Tracking</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm md:text-base lg:text-lg">
                  Monitor performance with reports to identify and remediate weaknesses.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

       {/* Pricing Section */}
       <PricingCards />


       {/* AnnouncementCard */}
       <AnnouncementCard/>

        {/* QBank Details */}
      <div className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold sm:font-bold text-center mb-12">
            SaudiKnowledgeSeeker QBank Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="sm:p-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2  text-xl">
                  <Target className="h-5 w-5 text-primary text-xl" />
                  Question Design
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm md:text-base lg:text-lg">
                  Our practice questions are developed by SBPM experts to mirror the rigor of the actual exam.
                  They feature authentic clinical scenarios and emphasize key areas such as epidemiology,
                  biostatistics, public health, and prevention.
                </p>
              </CardContent>
            </Card>

            <Card className="sm:p-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BarChart className="h-5 w-5 text-examSecondary" />
                  Number of Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-muted-foreground">
                  <p>• 800+ questions for Part 1</p>
                  <p>• 750+ questions for each Promotion level</p>
                  <p>• 1,000+ questions for the Final Part</p>
                  <p className="mt-3 font-medium">Each question includes comprehensive, clinically-relevant explanations.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="sm:p-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="h-5 w-5 text-examSecondary" />
                  Content Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We ensure our content is always current by aligning with the latest SBPM blueprints
                  and updating questions based on new guidelines and best practices. Subscribers receive automatic updates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>


      <div className="py-8 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold sm:font-bold text-center mb-12">
            What Makes Us Unique?
          </h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
              <span className="text-base sm:text-lg">High-yield questions</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
              <span className="text-base sm:text-lg">Comprehensive explanations</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
              <span className="text-base sm:text-lg">Reliable references</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
              <span className="text-base sm:text-lg">Progress tracking features</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-black">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold sm:font-bold mb-6">Ready to Master Your SBPM Exams?</h2>
            <p className="text-sm sm:text-xl mb-8 opacity-90">
              Join the experts and boost your performance with our comprehensive question bank.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="default" asChild className="text-base sm:text-lg py-3  sm:py-5 px-6 sm:px-8">
                <Link to="/register">Start Your Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base sm:text-lg py-3  sm:py-5 px-6 sm:px-8 border-primary text-primary">
                <Link to="#pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>





      {/* Agreement Statement */}


      {/* Footer Note */}
      {/* <Footer /> */}
    </div>
  );
};

export default Index;
