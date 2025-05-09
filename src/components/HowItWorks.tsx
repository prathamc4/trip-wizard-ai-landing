import React, { useState, useEffect } from "react";
import { Search, CheckCircle, Save, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Search,
    title: "Enter travel details",
    description: "Tell us your destination, dates, and budget preferences",
    color: "from-blue-500 to-teal-400",
  },
  {
    icon: CheckCircle,
    title: "Review personalized options",
    description:
      "Our AI selects the best matches for flights, hotels, and activities",
    color: "from-purple-500 to-indigo-500",
  },
  {
    icon: Save,
    title: "Finalize your plan",
    description:
      "Book everything in one place and share with your travel companions",
    color: "from-teal-500 to-emerald-400",
  },
];

const HowItWorks = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const section = document.getElementById("how-it-works");
    if (section) {
      observer.observe(section);
    }

    // Auto-advance through steps for visual demonstration
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => {
      if (section) observer.unobserve(section);
      clearInterval(interval);
    };
  }, []);

  return (
    <section
      id="how-it-works"
      className="py-24 md:py-32 relative overflow-hidden bg-gradient-to-b from-white to-slate-50"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent z-10"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-100/30 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-teal-100/30 blur-3xl"></div>
        <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-slate-200/50"></div>
        <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-slate-200/50"></div>
        <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-slate-200/50"></div>
      </div>

      <div className="container-custom relative z-10">
        <div
          className={`text-center mb-16 transition-all duration-700 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-800 tracking-tight">
            How It{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
              Works
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Plan your dream vacation in three simple steps with our AI-powered
            platform
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connection line */}
          <div className="hidden md:block absolute top-[85px] left-0 right-0 h-1 bg-slate-200 z-0">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              const isPast = index < activeStep;
              const stepStatus = isActive
                ? "active"
                : isPast
                ? "past"
                : "upcoming";

              return (
                <div
                  key={step.title}
                  className={`relative z-10 transition-all duration-500 transform ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-12"
                  }`}
                  style={{
                    animationDelay: `${index * 0.2}s`,
                    transitionDelay: `${index * 0.1}s`,
                  }}
                >
                  <div
                    className={cn(
                      "p-6 md:p-8 rounded-2xl bg-white shadow-xl h-full",
                      "transition-all duration-300 transform",
                      isActive
                        ? "scale-105 shadow-2xl border-b-4 border-blue-500"
                        : "scale-100",
                      isPast ? "bg-slate-50" : "bg-white"
                    )}
                  >
                    <div className="flex flex-col h-full">
                      <div className="mb-6 flex items-center">
                        <div
                          className={cn(
                            "flex items-center justify-center w-16 h-16 rounded-full",
                            "bg-gradient-to-br shadow-lg transition-all duration-500",
                            isActive
                              ? step.color
                              : isPast
                              ? "from-slate-400 to-slate-500"
                              : "from-slate-200 to-slate-300",
                            isActive ? "animate-pulse" : ""
                          )}
                        >
                          <step.icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="ml-4 md:hidden flex-1">
                          <span className="inline-block px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-600 mb-1">
                            Step {index + 1}
                          </span>
                          <h3 className="text-lg font-bold text-slate-800">
                            {step.title}
                          </h3>
                        </div>
                      </div>

                      <div className="hidden md:block">
                        <span
                          className={cn(
                            "inline-block px-2 py-1 rounded text-xs font-bold mb-2",
                            isActive
                              ? "bg-blue-100 text-blue-800"
                              : isPast
                              ? "bg-slate-100 text-slate-600"
                              : "bg-slate-100 text-slate-400"
                          )}
                        >
                          Step {index + 1}
                        </span>
                        <h3
                          className={cn(
                            "text-xl font-bold mb-3",
                            isActive
                              ? "text-slate-800"
                              : isPast
                              ? "text-slate-700"
                              : "text-slate-500"
                          )}
                        >
                          {step.title}
                        </h3>
                      </div>

                      <p
                        className={cn(
                          "text-base flex-grow",
                          isActive
                            ? "text-slate-600"
                            : isPast
                            ? "text-slate-500"
                            : "text-slate-400"
                        )}
                      >
                        {step.description}
                      </p>

                      <div className="mt-6 flex justify-between items-center">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isActive
                              ? "text-blue-600"
                              : isPast
                              ? "text-teal-500"
                              : "text-slate-400"
                          )}
                        >
                          {isActive
                            ? "In Progress"
                            : isPast
                            ? "Completed"
                            : "Coming Up"}
                        </span>

                        <span
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                            isActive
                              ? "bg-blue-100 text-blue-800"
                              : isPast
                              ? "bg-teal-100 text-teal-800"
                              : "bg-slate-100 text-slate-400"
                          )}
                        >
                          {isPast ? <CheckCircle size={16} /> : index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={`mt-16 text-center transition-all duration-700 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
          style={{ transitionDelay: "0.6s" }}
        >
          <Button className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-full px-8 py-6 font-medium text-lg group">
            <span className="flex items-center">
              Start Planning Now
              <ChevronRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
