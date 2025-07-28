import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-br from-primary/10 via-background to-examAccent/10 py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-5xl mx-auto">
          <Badge
            variant="secondary"
            className="bg-gradient-to-r from-violet-400 to-purple-500 text-white text-sm sm:text-base px-4 sm:px-6 py-2 rounded-full font-semibold shadow-md mb-6 animate-pulse"
          >
            Limited-Time Offer: 30% Soft Opening Discount on All Plans!
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-black mb-4">
            Saudi Board of Preventive Medicine (SBPM)
          </h1>

          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
            Question Bank
          </h2>

          <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
            High-Quality SBPM® Practice Questions You Can Trust.
          </p>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            The top resource for preparing for Saudi Board of Preventive Medicine certification and promotion examinations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              asChild
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3"
            >
              <Link to="/register">Start Your Preparation</Link>
            </Button>

            <Button
              size="lg"
              variant="default"
              asChild
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 bg-primary/90 hover:bg-primary text-white"
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
