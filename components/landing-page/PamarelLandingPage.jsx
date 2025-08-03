import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const PamarelLandingPage = () => {
  return (
    <>
      <Head>
        <title>Pamarel - Shop, Earn, Grow</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&family=Montserrat:wght@800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans">
        {/* Hero Section */}
        <header className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 font-montserrat tracking-tight">
              Welcome to <span className="text-yellow-300">Pamarel</span>
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-10 font-light">
              Your gateway to shopping, earning, and business opportunities
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="#marketplace" className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-all transform hover:scale-105">
                Explore Marketplace
              </Link>
              <Link href="#mlm" className="px-8 py-3 bg-white hover:bg-gray-100 text-blue-600 font-semibold rounded-lg transition-all transform hover:scale-105">
                Earn With Us
              </Link>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-white transform skew-y-1 origin-top-left"></div>
        </header>

        {/* Marketplace Section */}
        <section id="marketplace" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 font-playfair">
                Shop and Save in Our Marketplace
              </h2>
              <div className="w-20 h-1 bg-yellow-400 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl">
                <div className="h-48 bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
                  <h3 className="text-3xl font-bold text-white font-montserrat">Pamarel Food Market</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-6">
                    Discover fresh groceries, organic produce, and gourmet foods at unbeatable prices.
                  </p>
                  <Link href="/food-market" className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all">
                    Shop Now
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl">
                <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <h3 className="text-3xl font-bold text-white font-montserrat">Pamarel Gadget Hub</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-6">
                    Latest tech gadgets, electronics, and accessories with exclusive member discounts.
                  </p>
                  <Link href="/gadget-hub" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all">
                    Explore Gadgets
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MLM Section */}
        <section id="mlm" className="py-20 bg-gray-900 text-white px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 font-playfair">
                Refer and Earn Through Our MLM System
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Build your network and earn passive income with our multi-level marketing program
              </p>
              <div className="w-20 h-1 bg-yellow-400 mx-auto mt-4"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-800 rounded-xl p-8 transform transition-all hover:scale-105 hover:shadow-2xl border border-gray-700">
                <h3 className="text-2xl font-bold mb-4 text-yellow-400 font-montserrat">Basic Package</h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>5% referral bonus</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>1st level commissions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Basic training</span>
                  </li>
                </ul>
                <button className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-all">
                  Get Started
                </button>
              </div>

              <div className="bg-blue-900 rounded-xl p-8 transform transition-all hover:scale-105 hover:shadow-2xl border border-blue-700 relative">
                <div className="absolute top-0 right-0 bg-yellow-400 text-blue-900 px-3 py-1 font-bold text-sm rounded-bl-lg">
                  POPULAR
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white font-montserrat">Classic Package</h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>10% referral bonus</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>3-level commissions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Advanced training</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Marketing materials</span>
                  </li>
                </ul>
                <button className="w-full py-3 bg-blue-700 hover:bg-blue-600 rounded-lg font-medium transition-all">
                  Upgrade Now
                </button>
              </div>

              <div className="bg-purple-900 rounded-xl p-8 transform transition-all hover:scale-105 hover:shadow-2xl border border-purple-700">
                <h3 className="text-2xl font-bold mb-4 text-white font-montserrat">Platinum Package</h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>15% referral bonus</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>5-level commissions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Premium training</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Personal coach</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Exclusive events</span>
                  </li>
                </ul>
                <button className="w-full py-3 bg-purple-700 hover:bg-purple-600 rounded-lg font-medium transition-all">
                  Go Platinum
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Business Opportunities Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6 font-playfair">
                  Business Opportunities
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Join the Pamarel network and grow your business with our support and infrastructure.
                </p>

                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-400">
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">Become a Stockist or Packup Centre</h3>
                    <p className="text-gray-600 mb-4">
                      Partner with us to distribute products in your area and earn additional income.
                    </p>
                    <Link href="/apply-stockist" className="inline-block px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-all">
                      Apply Here
                    </Link>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">Join Pamarel Today</h3>
                    <p className="text-gray-600 mb-4">
                      Start your journey with Pamarel and unlock a world of opportunities.
                    </p>
                    <Link href="/signup" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all">
                      Sign Up Here
                    </Link>
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="relative">
                  <div className="w-full h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl"></div>
                  <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-yellow-400 rounded-2xl shadow-xl flex items-center justify-center">
                    <span className="text-gray-900 font-bold text-xl text-center">Start Your Business Journey Today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 font-montserrat">Pamarel</h3>
              <p className="text-gray-400">
                Empowering communities through shopping and business opportunities.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Marketplace</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition">Food Market</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">Gadget Hub</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">New Arrivals</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">Special Offers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Earn With Us</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition">MLM Packages</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">Compensation Plan</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">Success Stories</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">Training</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">support@pamarel.com</li>
                <li className="text-gray-400">+1 (234) 567-8900</li>
                <li className="text-gray-400">123 Business Ave, City</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Pamarel. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default PamarelLandingPage;