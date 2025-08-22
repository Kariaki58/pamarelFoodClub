"use client";
import Link from 'next/link';

export default function Hero() {
  return (
    <header className="relative py-20 px-4 sm:px-6 lg:px-8 text-white overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 z-0 bg-gray-900">
        <div className="absolute inset-0 opacity-80 bg-gradient-to-r from-gray-900 to-blue-900"></div>
        <div className="absolute inset-0 bg-grid-pattern"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-yellow-400 mix-blend-overlay opacity-10"></div>
        
        {/* Animated elements */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-yellow-400 rounded-full mix-blend-overlay opacity-5 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-yellow-300 rounded-full mix-blend-overlay opacity-5 animate-ping"></div>
      </div>
      
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 font-montserrat tracking-tight">
          Welcome to <span className="text-yellow-300">Pamarel</span>
        </h1>
        <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-10 font-light">
          Your gateway to shopping, earning, and business opportunities
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/market" className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-all transform hover:scale-105">
            Explore Marketplace
          </Link>
          <Link href="/join-member" className="px-8 py-3 bg-white hover:bg-gray-100 text-blue-600 font-semibold rounded-lg transition-all transform hover:scale-105">
            Earn With Us
          </Link>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white transform skew-y-1 origin-top-left"></div>
      
      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </header>
  );
}