import React from 'react';
import { Megaphone, Calendar, BookOpen, Sparkles, Star } from 'lucide-react';

const AnnouncementCard = () => {
  const upcomingExams = [
    {
      title: "Epidemiology/Biostatistics/Vital Statistics and Demography",
      examType: "SBPM Final Clinical Exam - SOE"
    },
    {
      title: "Maternal & Child Health",
      examType: "SBPM Final Clinical Exam - SOE, OSCE"
    },
    {
      title: "Clinical Preventive Medicine: Communicable Diseases",
      examType: "SBPM Final Clinical Exam - SOE, OSCE"
    },
    {
      title: "Clinical Preventive Medicine: Non-Communicable Diseases",
      examType: "SBPM Final Clinical Exam - OSCE"
    },
    {
      title: "Healthcare Management, Quality, and Informatics",
      examType: "SBPM Final Clinical Exam - SOE"
    }
  ];

  const qbankCategories = [
    {
      title: "Advanced Epidemiology/Biostatistics/Vital Statistics and Demography",
      description: "This QBank is needed for the Part 1 Exam, Part Final (2) Written Exam, and Promotion 1 and 3 Exams",
      questionsCount: "250+ Questions",
      plans: [
        { duration: "1 Month", originalPrice: "449 SAR", price: "314 SAR" },
        { duration: "3 Months", originalPrice: "499 SAR", price: "349 SAR" },
        { duration: "6 Months", originalPrice: "559 SAR", price: "391 SAR" }
      ],
      color: "bg-blue-600"
    },
    {
      title: "Clinical Preventive Medicine: Communicable Diseases",
      description: "This QBank is needed for the Part 1 Exam, Part Final (2) Written Exam, and Promotion 2 Exam",
      questionsCount: "185+ Questions",
      plans: [
        { duration: "1 Month", originalPrice: "339 SAR", price: "237 SAR" },
        { duration: "3 Months", originalPrice: "379 SAR", price: "265 SAR" },
        { duration: "6 Months", originalPrice: "429 SAR", price: "300 SAR" }
      ],
      color: "bg-green-600"
    },
    {
      title: "Clinical Preventive Medicine: Non-Communicable Diseases",
      description: "This QBank is needed for the Part 1 Exam, Part Final (2) Written Exam, and Promotion 2 Exam",
      questionsCount: "160+ Questions",
      plans: [
        { duration: "1 Month", originalPrice: "279 SAR", price: "195 SAR" },
        { duration: "3 Months", originalPrice: "319 SAR", price: "223 SAR" },
        { duration: "6 Months", originalPrice: "369 SAR", price: "258 SAR" }
      ],
      color: "bg-purple-600"
    },
    {
      title: "Maternal & Child Health",
      description: "This QBank is needed for the Part Final (2) Written Exam, and Promotion 3 Exam",
      questionsCount: "115+ Questions",
      plans: [
        { duration: "1 Month", originalPrice: "179 SAR", price: "125 SAR" },
        { duration: "3 Months", originalPrice: "229 SAR", price: "160 SAR" },
        { duration: "6 Months", originalPrice: "279 SAR", price: "195 SAR" }
      ],
      color: "bg-pink-600"
    },
    {
      title: "Disaster's Management",
      description: "This QBank is needed for the Part Final (2) Written Exam, and Promotion 3 Exam",
      questionsCount: "100+ Questions",
      plans: [
        { duration: "1 Month", originalPrice: "169 SAR", price: "118 SAR" },
        { duration: "3 Months", originalPrice: "219 SAR", price: "153 SAR" },
        { duration: "6 Months", originalPrice: "269 SAR", price: "188 SAR" }
      ],
      color: "bg-red-600"
    },
    {
      title: "Occupational & Environmental Health",
      description: "This QBank is needed for the Part 1 Exam, Part Final (2) Written Exam, and Promotion 1 Exam",
      questionsCount: "95+ Questions",
      plans: [
        { duration: "1 Month", originalPrice: "149 SAR", price: "104 SAR" },
        { duration: "3 Months", originalPrice: "199 SAR", price: "139 SAR" },
        { duration: "6 Months", originalPrice: "249 SAR", price: "174 SAR" }
      ],
      color: "bg-teal-600"
    },
    {
      title: "Experimental Designs",
      description: "This QBank is needed for Part Final (2) Written Exam, and Promotion 3 Exam",
      questionsCount: "75+ Questions",
      plans: [
        { duration: "1 Month", originalPrice: "119 SAR", price: "83 SAR" },
        { duration: "3 Months", originalPrice: "159 SAR", price: "111 SAR" },
        { duration: "6 Months", originalPrice: "199 SAR", price: "139 SAR" }
      ],
      color: "bg-orange-600"
    },
    {
      title: "Infection Control",
      description: "This QBank is needed for the Part Final (2) Written Exam, and Promotion 3 Exam",
      questionsCount: "85+ Questions",
      plans: [
        { duration: "1 Month", originalPrice: "119 SAR", price: "83 SAR" },
        { duration: "3 Months", originalPrice: "169 SAR", price: "118 SAR" },
        { duration: "6 Months", originalPrice: "219 SAR", price: "153 SAR" }
      ],
      color: "bg-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-0 sm:py-2 px-0 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Exciting Update Section */}
        <div className="mb-20">
          <div className="relative rounded-3xl p-4 sm:p-10 shadow-2xl text-white overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-yellow-400/10 rounded-full animate-bounce delay-500"></div>
            <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-pink-400/10 rounded-full animate-pulse delay-700"></div>
            
            {/* Floating Stars */}
            <div className="absolute top-8 right-8">
              <Star className="h-6 w-6 text-yellow-300 animate-pulse" fill="currentColor" />
            </div>
            <div className="absolute bottom-8 left-8">
              <Sparkles className="h-5 w-5 text-pink-300 animate-pulse delay-500" />
            </div>
            <div className="absolute top-16 left-16">
              <Star className="h-4 w-4 text-blue-300 animate-pulse delay-1000" fill="currentColor" />
            </div>
            
            <div className="relative z-10">
              {/* Header with Enhanced Styling */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 sm:gap-4  px-2 sm:px-8 py-2 sm:py-4 mb-6 ">
                  <div className="bg-yellow-400  p-1 sm:p-2 rounded-full animate-bounce">
                    <Megaphone className="h-4 sm:h-6 w-4 sm:w-6 text-[#7E39ED]" />
                  </div>
                  <h2 className="text-xl md:text-4xl font-extrabold sm:font-bold text-black">
                    Exciting Update from SaudiKnowledgeSeeker!
                  </h2>
                  <span className="text-lg sm:text-3xl animate-bounce delay-300">📢</span>
                </div>
                
                <div className=" rounded-2xl p-6 text-black">

                  <p className="text-sm sm:text-xl md:text-2xl font-medium  mb-2">
                    🎉 The following exams are coming soon to our website:
                  </p>
                  <p className="text-sm sm:text-lg">
                    Get ready to advance your medical career!
                  </p>
                </div> 
              </div>
              
              {/* Enhanced Exam Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {upcomingExams.map((exam, index) => (
                  <div 
                    key={index} 
                    className="group bg-primary  rounded-xl p-2 md:p-6 border transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-6 sm:w-12 h-6 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-400 text-[#7E39ED] rounded-full flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold  mb-3 leading-tight text-base sm:text-lg group-hover:text-yellow-200 transition-colors duration-300">
                          {exam.title}
                        </h3>
                        <div className="flex items-center gap-2 text-purple-200 text-sm bg-white/10 rounded-full px-3 py-1 border border-white/20">
                          <BookOpen className="h-2 sm:h-4 w-2 sm:w-4 text-yellow-300" />
                          <span className="font-medium">{exam.examType}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover Effect Line */}
                    <div className="mt-4 h-1 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  </div>
                ))}
              </div>
              
              {/* Enhanced Call-to-Action */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center gap-3 bg-primary rounded-full px-8 py-4 border border-white/30 shadow-lg">
                  <Calendar className="h-6 w-6 text-yellow-300 animate-pulse" />
                  <span className="text-sm md:text-xl font-bold ">
                    Stay tuned for more details and prepare to excel with SaudiKnowledgeSeeker!
                  </span>
                  <Sparkles className="h-6 w-6 text-pink-300 animate-pulse delay-500" />
                </div>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-black">
                  <span className="text-sm font-medium">Your success journey starts here</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 animate-pulse" fill="currentColor" style={{ animationDelay: `${i * 200}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default AnnouncementCard;