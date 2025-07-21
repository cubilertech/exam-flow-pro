import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-br from-primary/10 via-background to-examAccent/10">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center max-w-5xl mx-auto">
          <Badge
            variant="secondary"
            className="bg-gradient-to-r from-violet-400 to-purple-500 text-white text-sm sm:text-lg px-5 sm:px-6 py-2 sm:py-3 rounded-full sm:font-bold font-semibold shadow-lg animate-pulse mb-5"
          >
            Limited-Time Offer: 30% Soft Opening Discount on All Plans!
          </Badge>
          <h1 className="text-2xl md:text-4xl lg:text-6xl font-extrabold sm:font-bold leading-tight tracking-tighter mb-6 text-black">
            Saudi Board of Preventive Medicine (SBPM)
            <span className="text-primary block mt-2 text-xl sm:text-4xl lg:text-5xl">
              Question Bank
            </span>
          </h1>
          <p className="text-sm md:text-xl lg:text-2xl text-black mb-6 max-w-3xl mx-auto">
            High-Quality SBPM® Practice Questions You Can Trust
          </p>
          <p className="text-base md:text-xl lg:text-2xl text-black mb-8 max-w-3xl mx-auto">
            The top resource for preparing for Saudi Board of Preventive Medicine certification and promotion examinations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3"
            >
              <Link to="/register">Start Your Preparation</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 border-primary bg-primary text-white"
            >
              <Link to="/login">Login to Continue</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
