
import React from 'react';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    quote: "The AI Travel Planner saved me hours of research. It found hotels and activities I would have never discovered on my own!",
    author: "Sarah Johnson",
    role: "Frequent Traveler"
  },
  {
    quote: "Planning our family vacation used to be stressful, but this tool made it easy. The personalized itinerary was perfect for our needs.",
    author: "Michael Thompson",
    role: "Family Vacationer"
  },
  {
    quote: "As a business traveler, I need efficient plans. This AI tool consistently finds the best flight options and convenient hotels.",
    author: "Jessica Chen",
    role: "Business Executive"
  }
];

const Testimonials = () => {
  return (
    <section className="section bg-travel-blue bg-opacity-5">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real experiences from travelers who've used our platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className={cn(
                "bg-white p-8 rounded-lg shadow-md transition-all duration-300",
                "hover:shadow-lg animate-fade-up"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <svg className="h-8 w-8 text-travel-blue opacity-50" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M10 8v6a6 6 0 01-6 6H4v4h4a10 10 0 0010-10V8h-8zm12 0v6a6 6 0 01-6 6h0v4h4a10 10 0 0010-10V8h-8z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-6 flex-grow italic">
                  "{testimonial.quote}"
                </p>
                <div className="mt-auto">
                  <p className="font-semibold text-gray-800">{testimonial.author}</p>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
