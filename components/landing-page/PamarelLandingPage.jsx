import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';


const PamarelLandingPage = () => {
  return (
    <>
      <Head>
        <title>Pamarel - Shop, Earn, Grow</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&family=Montserrat:wght@800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      </Head>


      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans">
        {/* Hero Section with Background Image */}
        <header className="relative py-20 px-4 sm:px-6 lg:px-8 text-white">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/img-2.jpeg"
              alt="Example"
              className="w-full h-full object-cover object-center"
              loading="eager"
              decoding="sync"
            />
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
              <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition-all hover:scale-[1.02] hover:shadow-2xl">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src="/img-3.jpeg"
                    alt="Pamarel Food Market"
                    fill
                    className='object-cover'
                    // className="transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                    <h3 className="text-3xl font-bold text-white font-montserrat">Pamarel Food Market</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-6">
                    Discover fresh groceries, organic produce, and gourmet foods at unbeatable prices.
                  </p>
                  <Link href="/market?hub=food" className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all">
                    Shop Now
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition-all hover:scale-[1.02] hover:shadow-2xl">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src="/img-1.jpeg"
                    alt="Pamarel Gadget Hub"
                    fill
                    className='object-cover'
                    // className="transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                    <h3 className="text-3xl font-bold text-white font-montserrat">Pamarel Gadget Hub</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-6">
                    Latest tech gadgets, electronics, and accessories with exclusive member discounts.
                  </p>
                  <Link href="/market?hub=gadget" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all">
                    Explore Gadgets
                  </Link>
                </div>
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
                    <Link href="/join-member" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all">
                      Sign Up Here
                    </Link>
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="relative">
                  <div className="relative w-full h-96 rounded-3xl shadow-2xl overflow-hidden">
                    <Image
                      src="/plo.jpg"
                      alt="Business opportunity"
                      fill
                      className='object-cover'
                    />
                  </div>
                  <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-yellow-400 rounded-2xl shadow-xl flex items-center justify-center">
                    <span className="text-gray-900 font-bold text-xl text-center">Start Your Business Journey Today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default PamarelLandingPage;