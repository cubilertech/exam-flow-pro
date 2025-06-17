import { useAppSelector } from "@/lib/hooks";
import { Dashboard } from "@/components/core/Dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import { BookOpen, TestTube, BarChart, Users, CheckCircle, Clock, Target, TrendingUp, Globe, Shield } from "lucide-react";

const Index = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

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
            <Badge variant="success" className="text-lg px-4 py-2">
              30% Soft Opening Discount applied to all plans for a limited time!
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* SBPM Part 1 QBank */}
            <Card className="relative border-2 hover:border-primary/20 transition-all">
              <CardHeader>
                <CardTitle className="text-xl text-center">SBPM Part 1 QBank</CardTitle>
                <CardDescription className="text-center">Full QBank Access, 800+ Questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>3 months Access:</span>
                    <div className="text-right">
                      <span className="line-through text-muted-foreground">1249 SAR</span>
                      <span className="text-lg font-bold text-primary ml-2">874 SAR</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>6 months Access:</span>
                    <div className="text-right">
                      <span className="line-through text-muted-foreground">1399 SAR</span>
                      <span className="text-lg font-bold text-primary ml-2">979 SAR</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>12 months Access:</span>
                    <div className="text-right">
                      <span className="line-through text-muted-foreground">1599 SAR</span>
                      <span className="text-lg font-bold text-primary ml-2">1084 SAR</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full" asChild>
                  <Link to="/register">Choose Plan</Link>
                </Button>
              </CardContent>
            </Card>

            {/* SBPM Promotion QBanks */}
            <Card className="relative border-2 hover:border-primary/20 transition-all">
              <CardHeader>
                <CardTitle className="text-xl text-center">SBPM Promotion 1, 2, or 3</CardTitle>
                <CardDescription className="text-center">Full QBank Access, 750+ Questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>3 months Access:</span>
                    <div className="text-right">
                      <span className="line-through text-muted-foreground">1119 SAR</span>
                      <span className="text-lg font-bold text-primary ml-2">783 SAR</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>6 months Access:</span>
                    <div className="text-right">
                      <span className="line-through text-muted-foreground">1269 SAR</span>
                      <span className="text-lg font-bold text-primary ml-2">888 SAR</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>12 months Access:</span>
                    <div className="text-right">
                      <span className="line-through text-muted-foreground">1419 SAR</span>
                      <span className="text-lg font-bold text-primary ml-2">993 SAR</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full" asChild>
                  <Link to="/register">Choose Plan</Link>
                </Button>
              </CardContent>
            </Card>

            {/* SBPM Part Final QBank */}
            <Card className="relative border-2 border-primary/30 hover:border-primary/50 transition-all">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-primary text-white">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl text-center">SBPM Part Final (2) Written</CardTitle>
                <CardDescription className="text-center">Full QBank Access, 1,000+ Questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>3 months Access:</span>
                    <div className="text-right">
                      <span className="line-through text-muted-foreground">1349 SAR</span>
                      <span className="text-lg font-bold text-primary ml-2">944 SAR</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>6 months Access:</span>
                    <div className="text-right">
                      <span className="line-through text-muted-foreground">1499 SAR</span>
                      <span className="text-lg font-bold text-primary ml-2">1049 SAR</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>12 months Access:</span>
                    <div className="text-right">
                      <span className="line-through text-muted-foreground">1599 SAR</span>
                      <span className="text-lg font-bold text-primary ml-2">1119 SAR</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full" asChild>
                  <Link to="/register">Choose Plan</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Individual Subjects */}
          <div className="mt-12">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-xl text-center">SBPM Individual Subjects QBank</CardTitle>
                <CardDescription className="text-center text-sm leading-relaxed">
                  Epidemiology/Biostatistics/Vital Statistics and Demography, Healthcare Management, Quality and Informatics, 
                  Experimental Designs, Behavioral and Social Health, Health Education and Promotion, Maternal & Child Health, 
                  Clinical Preventive Medicine: Communicable Diseases, Clinical Preventive Medicine: Non-Communicable Diseases, 
                  Occupational & Environmental Health, Critical Appraisal & Research Proposal Writing, Health Planning, 
                  Evaluation and Economics, Infection Control, Disaster's Management, and Communicating Health Information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 border rounded-lg">
                    <div className="text-lg font-bold text-primary">159 SAR</div>
                    <div className="text-sm text-muted-foreground">1 month Access</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-lg font-bold text-primary">189 SAR</div>
                    <div className="text-sm text-muted-foreground">3 months Access</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-lg font-bold text-primary">219 SAR</div>
                    <div className="text-sm text-muted-foreground">6 months Access</div>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline" asChild>
                  <Link to="/register">View Individual Subjects</Link>
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
      
      {/* Agreement Statement Section */}
      <div className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Subscriber Agreement for Medical Exam Question Banks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6 text-sm leading-relaxed">
                  <p>
                    This Subscriber Agreement ("Agreement") is entered into between SaudiKnowledgeSeeker Company ("Provider"), 
                    owner of the medical exam question banks, including Preventive Medicine (Part 1, Part Final, Promotion 1, 2, 3, 
                    and Final Clinical Examination) ("Materials"), and the individual or entity subscribing to access the Materials ("Subscriber"). 
                    By clicking "Agree," the Subscriber agrees to be bound by the terms below.
                  </p>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">1. Access</h3>
                    <p className="mb-2">
                      1.1 The Provider grants the Subscriber a non-exclusive, non-transferable, limited license to access 
                      the selected Materials for personal, non-commercial educational purposes, such as exam preparation.
                    </p>
                    <p>
                      1.2 Access is provided via SaudiKnowledgeSeeker platform and requires an active subscription and 
                      compliance with this Agreement.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">2. Intellectual Property</h3>
                    <p className="mb-2">
                      2.1 The Materials, including questions, and explanations, are the Provider's exclusive intellectual property, 
                      protected by copyright and other laws.
                    </p>
                    <p>
                      2.2 No ownership or rights to the Materials are transferred, and all rights not granted are reserved by the Provider.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">3. Use Restrictions</h3>
                    <p className="mb-2">3.1 The Subscriber shall not:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1 mb-2">
                      <li>Copy, reproduce, distribute, publish, or share the Materials, in whole or part, in any form without prior written consent.</li>
                      <li>Modify, adapt, or create derivative works from the Materials.</li>
                      <li>Share access credentials with third parties.</li>
                      <li>Use the Materials for commercial purposes, e.g., resale or training.</li>
                    </ul>
                    <p>
                      3.2 Unauthorized use is a breach of this Agreement and violates the Provider's intellectual property rights.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">4. Breach Consequences</h3>
                    <p className="mb-2">4.1 Upon breach, including unauthorized copying or distribution:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1 mb-2">
                      <li>Access will be terminated immediately without refund.</li>
                      <li>Legal action will be pursued for damages and injunctive relief under intellectual property laws.</li>
                    </ul>
                    <p>
                      4.2 The Subscriber is liable for all legal fees and damages incurred by the Provider.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">5. Confidentiality</h3>
                    <p>
                      5.1 The Subscriber agrees to treat the Materials as confidential and prevent unauthorized disclosure.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">6. Term and Termination</h3>
                    <p className="mb-2">
                      6.1 This Agreement remains in effect during the active subscription or until terminated.
                    </p>
                    <p className="mb-2">
                      6.2 The Provider may terminate the Agreement upon breach, effective immediately with written notice.
                    </p>
                    <p>
                      6.3 Upon termination, the Subscriber must cease using and destroy all copies of the Materials.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">7. Liability Limitation</h3>
                    <p className="mb-2">
                      7.1 The Materials are provided "as is." The Provider does not guarantee accuracy or suitability for exams.
                    </p>
                    <p>
                      7.2 The Provider is not liable for damages arising from use of the Materials.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">8. Governing Law</h3>
                    <p className="mb-2">
                      8.1 This Agreement is governed by the laws of Saudi Arabia jurisdiction.
                    </p>
                    <p>
                      8.2 Disputes will be resolved via courts in Saudi Arabia.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">9. Entire Agreement</h3>
                    <p className="mb-2">
                      9.1 This Agreement supersedes all prior understandings.
                    </p>
                    <p>
                      9.2 The Provider may amend the Agreement, notifying the Subscriber via email.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">10. Acknowledgment</h3>
                    <p>
                      By clicking "Agree," the Subscriber acknowledges understanding and agreeing to these terms. 
                      Unauthorized use will result in legal action to protect the Provider's rights.
                    </p>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Contact Information:</h3>
                    <p>SaudiKnowledgeSeeker Company</p>
                    <p>Company Email: [Contact Email to be provided]</p>
                  </div>

                  <Separator className="my-8" />

                  {/* Arabic Version */}
                  <div className="text-right" dir="rtl">
                    <h2 className="font-bold text-xl mb-6 text-center">
                      اتفاقية الاشتراك في بنوك أسئلة الامتحانات الطبية
                    </h2>

                    <p className="mb-4">
                      تُبرم هذه الاتفاقية بين شركة SaudiKnowledgeSeeker ("المزود")، مالكة بنوك أسئلة الامتحانات الطبية، 
                      بما في ذلك الطب الوقائي (الجزء الأول، النهائي، الترقية 1، 2، 3، والامتحان السريري النهائي) ("المواد")، 
                      والفرد أو الكيان الذي يشترك للوصول إلى المواد ("المشترك"). بالضغط على "أوافق"، يلتزم المشترك بشروط الاتفاقية أدناه.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">1. الوصول</h3>
                        <p className="mb-2">
                          1.1 يمنح المزود المشترك ترخيصًا محدودًا غير حصري وغير قابل للنقل للوصول إلى المواد المختارة 
                          لأغراض تعليمية شخصية غير تجارية، مثل التحضير للامتحانات.
                        </p>
                        <p>
                          1.2 يتم توفير الوصول عبر منصة SaudiKnowledgeSeeker ويتطلب اشتراكًا نشطًا والامتثال لهذه الاتفاقية.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">2. الملكية الفكرية</h3>
                        <p className="mb-2">
                          2.1 المواد، بما في ذلك الأسئلة، التفسيرات، هي ملكية فكرية حصرية للمزود، 
                          محمية بقوانين حقوق الطبع والنشر وغيرها.
                        </p>
                        <p>
                          2.2 لا تُنقل حقوق الملكية للمشترك، وجميع الحقوق غير الممنوحة محفوظة للمزود.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">3. قيود الاستخدام</h3>
                        <p className="mb-2">3.1 يُحظر على المشترك:</p>
                        <ul className="list-disc list-inside mr-4 space-y-1 mb-2">
                          <li>نسخ، إعادة إنتاج، توزيع، نشر، أو مشاركة المواد، كليًا أو جزئيًا، بأي شكل دون موافقة خطية مسبقة.</li>
                          <li>تعديل، تكييف، أو إنشاء أعمال مشتقة من المواد.</li>
                          <li>مشاركة بيانات الوصول مع أطراف ثالثة.</li>
                          <li>استخدام المواد لأغراض تجارية، مثل إعادة البيع أو التدريب.</li>
                        </ul>
                        <p>
                          3.2 الاستخدام غير المصرح به يُعد خرقًا للاتفاقية وانتهاكًا لحقوق الملكية الفكرية.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">4. عواقب الخرق</h3>
                        <p className="mb-2">4.1 عند الخرق، بما في ذلك النسخ أو التوزيع غير المصرح به:</p>
                        <ul className="list-disc list-inside mr-4 space-y-1 mb-2">
                          <li>يُنهى الوصول فورًا دون استرداد الرسوم.</li>
                          <li>يتم اتخاذ إجراءات قانونية للحصول على تعويضات وأوامر قضائية بموجب قوانين الملكية الفكرية.</li>
                        </ul>
                        <p>
                          4.2 المشترك مسؤول عن جميع الرسوم القانونية والأضرار التي يتكبدها المزود.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">5. السرية</h3>
                        <p>
                          5.1 يوافق المشترك على التعامل مع المواد كمعلومات سرية ومنع الكشف غير المصرح به.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">6. المدة والإنهاء</h3>
                        <p className="mb-2">
                          6.1 الاتفاقية سارية طوال الاشتراك النشط أو حتى الإنهاء.
                        </p>
                        <p className="mb-2">
                          6.2 يجوز للمزود إنهاء الاتفاقية عند الخرق، بأثر فوري عند الإخطار الكتابي.
                        </p>
                        <p>
                          6.3 عند الإنهاء، يجب على المشترك التوقف عن استخدام المواد وتدمير جميع النسخ.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">7. تحديد المسؤولية</h3>
                        <p className="mb-2">
                          7.1 المواد مقدمة "كما هي". لا يضمن المزود دقة أو ملاءمة المواد للامتحانات.
                        </p>
                        <p>
                          7.2 المزود غير مسؤول عن أي أضرار ناتجة عن استخدام المواد.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">8. القانون الحاكم</h3>
                        <p className="mb-2">
                          8.1 تُحكم الاتفاقية بقوانين المملكة العربية السعودية.
                        </p>
                        <p>
                          8.2 تُحل النزاعات عبر المحاكم في المملكة العربية السعودية.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">9. الاتفاقية الكاملة</h3>
                        <p className="mb-2">
                          9.1 هذه الاتفاقية تحل محل جميع التفاهمات السابقة.
                        </p>
                        <p>
                          9.2 يجوز للمزود تعديل الاتفاقية، مع إخطار المشترك عبر البريد الإلكتروني.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">10. التأكيد</h3>
                        <p>
                          بالضغط على "أوافق"، يقر المشترك بفهم والالتزام بهذه الشروط. الاستخدام غير المصرح به 
                          سيؤدي إلى إجراءات قانونية لحماية حقوق المزود.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">معلومات التواصل:</h3>
                        <p>شركة SaudiKnowledgeSeeker</p>
                        <p>البريد الإلكتروني: [سيتم توفير البريد الإلكتروني]</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
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
