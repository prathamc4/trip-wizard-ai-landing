
import React from 'react';
import { Plane, Hotel, Calendar, Map } from 'lucide-react';

const featureItems = [
  {
    icon: Plane,
    title: 'Flight Search',
    description: 'Find the cheapest flights to your destination'
  },
  {
    icon: Hotel,
    title: 'Hotel Booking',
    description: 'Discover perfect accommodations within your budget'
  },
  {
    icon: Calendar,
    title: 'Smart Itinerary',
    description: 'Get a day-by-day plan customized to your preferences'
  },
  {
    icon: Map,
    title: 'Attraction Finder',
    description: 'Never miss must-see sites and activities'
  }
];

const Features = () => {
  return (
    <section id="features" className="section bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to plan the perfect travel experience
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featureItems.map((feature, index) => (
            <div 
              key={feature.title}
              className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-travel-blue bg-opacity-10">
                <feature.icon className="h-8 w-8 text-travel-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
