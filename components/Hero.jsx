"use client";
import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <header className="relative text-white overflow-hidden">
      {/* Background Image */}
      <div className="relative"> {/* Adjust height as needed */}
        <Image
          src="/banner_up.jpeg"
          alt="hero image"
          width={2000}
          height={300}
        />
      </div>
      <div className="max-w-7xl mx-auto text-center relative z-10">
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
    </header>
  );
}