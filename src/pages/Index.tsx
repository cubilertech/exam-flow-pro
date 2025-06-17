
import { useAppSelector } from "@/lib/hooks";
import { Dashboard } from "@/components/core/Dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { BookOpen, TestTube, BarChart, Users, CheckCircle, Clock, Target, TrendingUp, Globe, Shield } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";

const Index = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [selectedDuration, setSelectedDuration] = useState("3");

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
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-examAccent/10">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-5xl mx-auto">
            <Badge variant="secondary" className="mb-6 text-lg px-4 py-2">
              Limited-Time Offer: 30% Soft Opening Discount on All Plans!
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight tracking-tighter mb-6">
              Saudi Board of Preventive Medicine (SBPM)
              <span className="text-primary block mt-2">Question Bank</span>
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              High-Quality SBPM® Practice Questions You Can Trust
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
              The top resource for preparing for Saudi Board of Preventive Medicine certification and promotion examinations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8 py-3">
                <Link to="/register">Start Your Preparation</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-3">
                <Link to="/login">Login to Continue</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Master the SBPM Exams: Your Essential Study Companion
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-2 hover:border-primary/20 transition-all">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">1,000+ Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">At or above exam-level difficulty</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-2 hover:border-primary/20 transition-all">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-examSecondary/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-examSecondary" />
                </div>
                <CardTitle className="text-lg">Expert Explanations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">In-depth, evidence-based answer explanations</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-2 hover:border-primary/20 transition-all">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-examInfo/10 flex items-center justify-center mx-auto mb-4">
                  <TestTube className="h-6 w-6 text-examInfo" />
                </div>
                <CardTitle className="text-lg">Board-Simulated Interface</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Displayed in exam-like environment</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-2 hover:border-primary/20 transition-all">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-examPrimary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-examPrimary" />
                </div>
                <CardTitle className="text-lg">Expert Prepared</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">By Preventive Medicine and Public Health Experts</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-lg text-muted-foreground">
              Designed for SBPM Part 1, Promotion 1, 2, 3, and Part Final (2) Written exams
            </p>
          </div>
        </div>
      </div>

      {/* What to Expect */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-8">
              What to Expect from Your SBPM Question Bank
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 leading-relaxed">
              The SaudiKnowledgeSeeker SBPM QBank, crafted by preventive medicine and public health experts, 
              is designed to save you time and boost your performance on the Saudi Board of Preventive Medicine exams. 
              Covering the full SBPM blueprint for Part 1, Promotion 1, 2, 3, and Part Final (2) Written exams, 
              our 1,000+ practice questions offer personalized review to help you succeed and excel as a preventive medicine specialist.
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Learning Tools */}
      <div className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            Enhanced Learning Tools to Optimize Your Study
          </h2>
          <p className="text-lg text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            Our tools provide the flexibility and efficiency needed to maximize your preparation around a busy schedule.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-6">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <CardTitle className="text-xl">Comprehensive Explanations</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Visual, evidence-based rationales explain correct and incorrect answers, 
                  reinforcing key concepts like disease surveillance and health policy.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-6">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-examSecondary" />
                  <CardTitle className="text-xl">Progress Tracking</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Monitor performance with reports to identify and remediate weaknesses.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-16" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              SaudiKnowledgeSeeker SBPM Pricing
            </h2>
            <Badge variant="success" className="text-lg px-4 py-2 mb-8">
              30% Soft Opening Discount applied to all plans for a limited time!
            </Badge>
            
            {/* Duration Toggle */}
            <div className="flex justify-center mb-8">
              <ToggleGroup 
                type="single" 
                value={selectedDuration} 
                onValueChange={(value) => value && setSelectedDuration(value)}
                className="bg-muted rounded-lg p-1"
              >
                <ToggleGroupItem value="3" className="px-6 py-2">
                  3 Months
                </ToggleGroupItem>
                <ToggleGroupItem value="6" className="px-6 py-2">
                  6 Months
                </ToggleGroupItem>
                <ToggleGroupItem value="12" className="px-6 py-2">
                  12 Months
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* SBPM Part 1 QBank */}
            <Card className="relative border-2 hover:border-primary/20 transition-all">
              <CardHeader>
                <CardTitle className="text-xl text-center">SBPM Part 1 QBank</CardTitle>
                <CardDescription className="text-center">
                  Full QBank Access<br />
                  750+ Questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {pricingData[selectedDuration as keyof typeof pricingData].part1.price}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {pricingData[selectedDuration as keyof typeof pricingData].part1.duration} Access
                  </div>
                </div>
                <Button className="w-full" asChild>
                  <Link to="/register">Choose Plan</Link>
                </Button>
              </CardContent>
            </Card>

            {/* SBPM Promotion QBanks */}
            <Card className="relative border-2 border-primary/30 hover:border-primary/50 transition-all">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-primary text-white">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl text-center">SBPM Promotion 1, 2, or 3</CardTitle>
                <CardDescription className="text-center">
                  Full QBank Access<br />
                  750+ Questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {pricingData[selectedDuration as keyof typeof pricingData].promotion.price}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {pricingData[selectedDuration as keyof typeof pricingData].promotion.duration} Access
                  </div>
                </div>
                <Button className="w-full" asChild>
                  <Link to="/register">Choose Plan</Link>
                </Button>
              </CardContent>
            </Card>

            {/* SBPM Part Final QBank */}
            <Card className="relative border-2 hover:border-primary/20 transition-all">
              <CardHeader>
                <CardTitle className="text-xl text-center">SBPM Part Final (2) Written</CardTitle>
                <CardDescription className="text-center">
                  Full QBank Access<br />
                  750+ Questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {pricingData[selectedDuration as keyof typeof pricingData].final.price}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {pricingData[selectedDuration as keyof typeof pricingData].final.duration} Access
                  </div>
                </div>
                <Button className="w-full" asChild>
                  <Link to="/register">Choose Plan</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* QBank Details */}
      <div className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            SaudiKnowledgeSeeker QBank Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Question Design
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our practice questions are developed by SBPM experts to mirror the rigor of the actual exam. 
                  They feature authentic clinical scenarios and emphasize key areas such as epidemiology, 
                  biostatistics, public health, and prevention.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
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
            
            <Card className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-examInfo" />
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

      {/* What Makes Us Unique */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            What Makes Us Unique?
          </h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
              <span className="text-lg">High-yield questions</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
              <span className="text-lg">Comprehensive explanations</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
              <span className="text-lg">Reliable references</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
              <span className="text-lg">Progress tracking features</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to Master Your SBPM Exams?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join the experts and boost your performance with our comprehensive question bank.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-3">
                <Link to="/register">Start Your Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-3 bg-transparent border-white text-white hover:bg-white hover:text-primary">
                <Link to="#pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Agreement Statement */}
      <div className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8">
            Subscriber Agreement
          </h2>
          
          <div className="max-w-6xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Subscriber Agreement for Medical Exam Question Banks</CardTitle>
                <CardDescription>
                  Please read this agreement carefully before subscribing to our services.
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <div className="space-y-4 text-sm">
                  <p>
                    This Subscriber Agreement ("Agreement") is entered into between SaudiKnowledgeSeeker Company ("Provider"), 
                    owner of the medical exam question banks, including Preventive Medicine (Part 1, Part Final, Promotion 1, 2, 3, 
                    and Final Clinical Examination) ("Materials"), and the individual or entity subscribing to access the Materials ("Subscriber"). 
                    By clicking "Agree," the Subscriber agrees to be bound by the terms below.
                  </p>
                  
                  <div>
                    <h4 className="font-semibold mb-2">1. Access</h4>
                    <p>1.1 The Provider grants the Subscriber a non-exclusive, non-transferable, limited license to access the selected Materials for personal, non-commercial educational purposes, such as exam preparation.</p>
                    <p>1.2 Access is provided via SaudiKnowledgeSeeker platform and requires an active subscription and compliance with this Agreement.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">2. Intellectual Property</h4>
                    <p>2.1 The Materials, including questions, and explanations, are the Provider's exclusive intellectual property, protected by copyright and other laws.</p>
                    <p>2.2 No ownership or rights to the Materials are transferred, and all rights not granted are reserved by the Provider.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">3. Use Restrictions</h4>
                    <p>3.1 The Subscriber shall not:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Copy, reproduce, distribute, publish, or share the Materials, in whole or part, in any form without prior written consent.</li>
                      <li>Modify, adapt, or create derivative works from the Materials.</li>
                      <li>Share access credentials with third parties.</li>
                      <li>Use the Materials for commercial purposes, e.g., resale or training.</li>
                    </ul>
                    <p>3.2 Unauthorized use is a breach of this Agreement and violates the Provider's intellectual property rights.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">4. Breach Consequences</h4>
                    <p>4.1 Upon breach, including unauthorized copying or distribution:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Access will be terminated immediately without refund.</li>
                      <li>Legal action will be pursued for damages and injunctive relief under intellectual property laws.</li>
                    </ul>
                    <p>4.2 The Subscriber is liable for all legal fees and damages incurred by the Provider.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">5. Confidentiality</h4>
                    <p>5.1 The Subscriber agrees to treat the Materials as confidential and prevent unauthorized disclosure.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">6. Term and Termination</h4>
                    <p>6.1 This Agreement remains in effect during the active subscription or until terminated.</p>
                    <p>6.2 The Provider may terminate the Agreement upon breach, effective immediately with written notice.</p>
                    <p>6.3 Upon termination, the Subscriber must cease using and destroy all copies of the Materials.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">7. Liability Limitation</h4>
                    <p>7.1 The Materials are provided "as is." The Provider does not guarantee accuracy or suitability for exams.</p>
                    <p>7.2 The Provider is not liable for damages arising from use of the Materials.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">8. Governing Law</h4>
                    <p>8.1 This Agreement is governed by the laws of Saudi Arabia jurisdiction.</p>
                    <p>8.2 Disputes will be resolved via courts in Saudi Arabia.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">9. Entire Agreement</h4>
                    <p>9.1 This Agreement supersedes all prior understandings.</p>
                    <p>9.2 The Provider may amend the Agreement, notifying the Subscriber via email.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">10. Acknowledgment</h4>
                    <p>By clicking "Agree," the Subscriber acknowledges understanding and agreeing to these terms. Unauthorized use will result in legal action to protect the Provider's rights.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Contact Information:</h4>
                    <p>SaudiKnowledgeSeeker Company</p>
                    <p>Company Email: [Company Email]</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Footer Note */}
      <div className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Renewal Process:</strong> To renew your subscription, simply use the "Renew" option on your account page before your current subscription expires. 
              Your renewal will extend directly from the existing expiration date.
            </p>
            <p>© 2025 SaudiKnowledgeSeeker. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
