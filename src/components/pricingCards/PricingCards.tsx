import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Clock } from "lucide-react";
import { Badge } from "../ui/badge";

const PricingCards = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("3");

  const qbankData = [
    {
      id: 1,
      title: "SBPM Part 1 QBank",
      description: "Full QBank Access",
      questions: "800+ Questions",
      popular: false,
      OriginalPrices: {
        "3": "1249 SAR",
        "6": "1399 SAR",
        "12": "1599 SAR",
      },
      prices: {
        "3": "874 SAR",
        "6": "979 SAR",
        "12": "1084 SAR",
      },
    },
    {
      id: 2,
      title: "SBPM Promotion 1, 2, or 3 QBanks",
      description: "Full QBank Access",
      questions: "750+ Questions",
      popular: false,
      OriginalPrices: {
        "3": "1119 SAR",
        "6": "1269 SAR",
        "12": "1419 SAR",
      },
      prices: {
        "3": "783 SAR",
        "6": "888 SAR",
        "12": "993 SAR",
      },
    },
    {
      id: 3,
      title: "SBPM Part Final (2) Written QBank",
      description: "Full QBank Access",
      questions: "1000+ Questions",
      popular: false,
      OriginalPrices: {
        "3": "1349 SAR",
        "6": "1499 SAR",
        "12": "1599 SAR",
      },
      prices: {
        "3": "944 SAR",
        "6": "1049 SAR",
        "12": "1119 SAR",
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
              <ToggleGroupItem value="3" className="px-6 py-2 ">
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

        {/* Enhanced QBank Cards */}
        <div className="flex flex-wrap justify-center gap-y-6 sm:gap-8 ">
          {qbankData.map((qbank) => (
            <Card
              key={qbank.id}
              className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white/80 backdrop-blur-sm border-0 w-full max-w-sm`} >
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-center text-gray-800 leading-tight">
                  {qbank.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-sm sm:text-base">{qbank.description}</span>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-sm sm:text-base">{qbank.questions}</span>
                  </div>

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
                </div>

                <Button
                  className={`w-full py-6 sm:py-5 px-6 sm:px-8 text-base sm:text-lg font-semibold rounded-xl transition-all duration-200 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 `}
                  size="lg"
                >
                  Subscribe Now
                </Button>
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
