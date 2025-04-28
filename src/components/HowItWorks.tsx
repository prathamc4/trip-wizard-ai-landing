
import React from 'react';
import { Search, CheckCircle, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: Search,
    title: 'Enter travel details',
    description: 'Tell us your destination, dates, and budget preferences'
  },
  {
    icon: CheckCircle,
    title: 'Review personalized options',
    description: 'Our AI selects the best matches for flights, hotels, and activities'
  },
  {
    icon: Save,
    title: 'Finalize and save your travel plan',
    description: 'Book everything in one place and share with your travel companions'
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section bg-gradient-to-b from-white to-gray-50">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plan your dream vacation in three simple steps
          </p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Connection line */}
          <div className="hidden md:block absolute top-1/4 left-0 right-0 h-1 bg-travel-blue bg-opacity-20 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((step, index) => (
              <div 
                key={step.title}
                className="relative z-10 animate-fade-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={cn(
                    "flex items-center justify-center w-16 h-16 rounded-full mb-6",
                    "bg-travel-blue text-white shadow-lg animate-float"
                  )}>
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">
                    Step {index + 1}: {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
