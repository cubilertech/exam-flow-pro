import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Clock } from "lucide-react";
import { Badge } from "../ui/badge";

const PricingCards = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("3");

  const qbankData = [
    // {
    //   id: 1,
    //   title: "Advanced Epidemiology/Biostatistics/Vital Statistics and Demography QBank",
    //   description: "QBank is needed for the Part 1 Exam, Part Final (2) Written Exam, and Promotion 1 and 3 Exams",
    //   access: "Full QBank Access",
    //   questions: "800+ Questions",
    //   popular: false,
    //   OriginalPrices: {
    //     "1": "1249 SAR",
    //     "3": "1399 SAR",
    //     "6": "1599 SAR",
    //   },
    //   prices: {
    //     "1": "874 SAR",
    //     "3": "979 SAR",
    //     "6": "1084 SAR",
    //   },
    // },
    // {
    //   id: 2,
    //   title: "SBPM Promotion 1, 2, or 3 QBanks",
    //   access: "Full QBank Access",
    //   questions: "750+ Questions",
    //   popular: false,
    //   OriginalPrices: {
    //     "1": "1119 SAR",
    //     "3": "1269 SAR",
    //     "6": "1419 SAR",
    //   },
    //   prices: {
    //     "1": "783 SAR",
    //     "3": "888 SAR",
    //     "6": "993 SAR",
    //   },
    // },
    // {
    //   id: 3,
    //   title: "SBPM Part Final (2) Written QBank",
    //   access: "Full QBank Access",
    //   questions: "1000+ Questions",
    //   popular: false,
    //   OriginalPrices: {
    //     "3": "1349 SAR",
    //     "6": "1499 SAR",
    //     "12": "1599 SAR",
    //   },
    //   prices: {
    //     "3": "944 SAR",
    //     "6": "1049 SAR",
    //     "12": "1119 SAR",
    //   },
    // },

    {
      id: 1,
      title: "Advanced Epidemiology/Biostatistics/Vital Statistics and Demography QBank",
      description: "This QBank is needed for the Part 1 Exam, Part Final (2) Written Exam, and Promotion 1 and 3 Exams",
      access: "Full QBank Access",
      questions: "250+ Questions",
      popular: false,
      OriginalPrices: {
        1: "449 SAR",
        3: "499 SAR",
        6: "559 SAR",
      },
      prices: {
        1: "314 SAR",
        3: "349 SAR",
        6: "391 SAR",
      },
    },
    {
      id: 2,
      title: "Experimental Designs QBank",
      description: "This QBank is needed for Part Final (2) Written Exam, and Promotion 3 Exam",
      access: "Full QBank Access",
      questions: "75+ Questions",
      popular: false,
      OriginalPrices: {
        1: "119 SAR",
        3: "159 SAR",
        6: "199 SAR",
      },
      prices: {
        1: "83 SAR",
        3: "111 SAR",
        6: "139 SAR",
      },
    },
    {
      id: 3,
      title: "Clinical Preventive Medicine: Communicable Diseases QBank",
      description: "This QBank is needed for the Part 1 Exam, Part Final (2) Written Exam, and Promotion 2 Exam",
      access: "Full QBank Access",
      questions: "185+ Questions",
      popular: false,
      OriginalPrices: {
        1: "339 SAR",
        3: "379 SAR",
        6: "429 SAR",
      },
      prices: {
        1: "237 SAR",
        3: "265 SAR",
        6: "300 SAR",
      },
    },
    {
      id: 4,
      title: "Clinical Preventive Medicine: Non-Communicable Diseases QBank",
      description: "This QBank is needed for the Part 1 Exam, Part Final (2) Written Exam, and Promotion 2 Exam",
      access: "Full QBank Access",
      questions: "160+ Questions",
      popular: false,
      OriginalPrices: {
        1: "279 SAR",
        3: "319 SAR",
        6: "369 SAR",
      },
      prices: {
        1: "195 SAR",
        3: "223 SAR",
        6: "258 SAR",
      },
    },
    {
      id: 5,
      title: "Occupational & Environmental Health QBank",
      description: "This QBank is needed for the Part 1 Exam, Part Final (2) Written Exam, and Promotion 1 Exam",
      access: "Full QBank Access",
      questions: "95+ Questions",
      popular: false,
      OriginalPrices: {
        1: "149 SAR",
        3: "199 SAR",
        6: "249 SAR",
      },
      prices: {
        1: "104 SAR",
        3: "139 SAR",
        6: "174 SAR",
      },
    },
    {
      id: 6,
      title: "Infection Control QBank",
      description: "This QBank is needed for the Part Final (2) Written Exam, and Promotion 3 Exam",
      access: "Full QBank Access",
      questions: "85+ Questions",
      popular: false,
      OriginalPrices: {
        1: "119 SAR",
        3: "169 SAR",
        6: "219 SAR",
      },
      prices: {
        1: "83 SAR",
        3: "118 SAR",
        6: "153 SAR",
      },
    },
    {
      id: 7,
      title: "Maternal & Child Health QBank",
      description: "This QBank is needed for the Part Final (2) Written Exam, and Promotion 3 Exam",
      access: "Full QBank Access",
      questions: "115+ Questions",
      popular: false,
      OriginalPrices: {
        1: "179 SAR",
        3: "229 SAR",
        6: "279 SAR",
      },
      prices: {
        1: "125 SAR",
        3: "160 SAR",
        6: "195 SAR",
      },
    },
    {
      id: 8,
      title: "Disaster’s Management QBank",
      description: "This QBank is needed for the Part Final (2) Written Exam, and Promotion 3 Exam",
      access: "Full QBank Access",
      questions: "100+ Questions",
      popular: false,
      OriginalPrices: {
        1: "169 SAR",
        3: "219 SAR",
        6: "269 SAR",
      },
      prices: {
        1: "118 SAR",
        3: "153 SAR",
        6: "188 SAR",
      },
    },


  ];

  return (
    <div className="py-16 sm:px-6 bg-gradient-to-br from-slate-50 to-violet-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold sm:font-bold mb-4 text-primary">
              SaudiKnowledgeSeeker SBPM Pricing
            </h2>

            <Badge variant="success" className="text-sm sm:text-lg px-4 py-3 mb-8">
              30% Soft Opening Discount applied to all plans for a limited time!
            </Badge>
          </div>

          {/* Enhanced Toggle Group */}
          <div className="flex justify-center mb-8">
            <ToggleGroup
              type="single"
              value={selectedPeriod}
              onValueChange={(value) => value && setSelectedPeriod(value)}
              className=" rounded-lg p-1"
            >
              <ToggleGroupItem value="1" className="px-6 py-2 ">
                1 Months
              </ToggleGroupItem>
              <ToggleGroupItem value="3" className="px-6 py-2">
                3 Months
              </ToggleGroupItem>
              <ToggleGroupItem value="6" className="px-6 py-2">
                6 Months
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Enhanced QBank Cards */}
        <div className="flex flex-wrap justify-center gap-y-6 sm:gap-8 ">
          {qbankData.map((qbank) => (
            <Card
              key={qbank.id}
              className={`relative  overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white/80 backdrop-blur-sm border-0 w-full max-w-sm`} >


              <CardContent className="space-y-6 h-full flex flex-col justify-between content-between">
                <div className="text-center space-y-4">

                  <CardTitle className="text-xl py-4 font-bold text-center text-gray-800 leading-tight">
                    {qbank.title}
                  </CardTitle>


                  <div className=" text-muted-foreground">

                    <span className="font-medium text-sm sm:text-base">{qbank.description}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-sm sm:text-base">{qbank.access}</span>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-sm sm:text-base">{qbank.questions}</span>
                  </div>

                </div>

                <div className="text-center">
                

                  <div className="my-6 p-2 sm:p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl">
                    <div className=" text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      <div className="text-center flex flex-col items-center space-y-1">
                        <span className="text-base sm:text-xl  text-gray-400 line-through">
                          {qbank.OriginalPrices[selectedPeriod]}
                        </span>
                        <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                          {qbank.prices[selectedPeriod]}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      for {selectedPeriod} month
                      {selectedPeriod !== "1" ? "s" : ""}
                    </div>
                  </div>

                  <Button
                    className={`w-full py-6 sm:py-5 px-6 sm:px-8 text-base sm:text-lg font-semibold rounded-xl transition-all duration-200 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 `}
                    size="lg"
                  >
                    Subscribe Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="pt-12">
        <div className="container mx-auto  sm:px-24">
          <div className="text-center text-lg ">
            <div className="leading-relaxed ">
              <p className="text-3xl lg:text-4xl font-bold pb-3">Renewal Process</p>
              <p className=" sm:p-3 text-sm sm:text-base">

                To renew your subscription, simply use the "Renew" option on your account page before your current subscription expires.
                Your renewal will extend directly from the existing expiration date.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCards;
