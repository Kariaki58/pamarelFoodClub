"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function FoodEnssentails() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchFoodEssentials();
    
    // Update current time every second for countdown (for flash sales)
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchFoodEssentials = async () => {
    try {
      const response = await fetch('/api/products/food-essentials');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching food essentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeLeft = (endDate) => {
    const end = new Date(endDate);
    const difference = end - currentTime;
    
    if (difference <= 0) {
      return { expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      expired: false
    };
  };

  const calculateDiscountedPrice = (product) => {
    if (product.flashSale?.discountPercentage > 0) {
      const discount = product.price * (product.flashSale.discountPercentage / 100);
      return product.price - discount;
    }
    return product.price;
  };

  const formatTimeUnit = (value) => {
    return value < 10 ? `0${value}` : value;
  };

  const isFlashSaleActive = (product) => {
    if (!product.flashSale?.active) return false;
    
    const now = new Date();
    const startDate = new Date(product.flashSale.startDate);
    const endDate = new Date(product.flashSale.endDate);
    
    return now >= startDate && now <= endDate;
  };

  const CountdownTimer = ({ endDate }) => {
    const timeLeft = calculateTimeLeft(endDate);

    if (timeLeft.expired) {
      return (
        <div className="bg-red-500 text-white px-3 py-1 rounded text-sm font-bold">
          Expired
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 bg-green-500 text-white px-3 py-2 rounded-lg">
        <div className="text-center">
          <div className="text-xs font-semibold">HRS</div>
          <div className="text-lg font-bold">{formatTimeUnit(timeLeft.hours)}</div>
        </div>
        <div className="text-green-300 font-bold">:</div>
        <div className="text-center">
          <div className="text-xs font-semibold">MINS</div>
          <div className="text-lg font-bold">{formatTimeUnit(timeLeft.minutes)}</div>
        </div>
        <div className="text-green-300 font-bold">:</div>
        <div className="text-center">
          <div className="text-xs font-semibold">SECS</div>
          <div className="text-lg font-bold">{formatTimeUnit(timeLeft.seconds)}</div>
        </div>
      </div>
    );
  };

  // Don't show anything if no food products
  if (!loading && products.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div id="food" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-20 h-1 bg-yellow-500 mx-auto mb-4"></div>
            <h2 className="text-4xl font-bold text-gray-900">Food Essentials</h2>
            <p className="text-gray-600 mt-4">Fresh picks for every meal</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-6 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="food" className="py-16 bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div className="text-center lg:text-left mb-6 lg:mb-0">
            <div className="flex items-center justify-center lg:justify-start space-x-3 mb-2">
              <div className="w-5 h-10 bg-green-500 rounded"></div>
              <h2 className="text-2xl font-bold text-green-600">Fresh</h2>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Food Essentials</h1>
            <p className="text-gray-600 mt-2 text-lg">Fresh picks for every meal</p>
          </div>
          
          {/* Global Countdown - shows the earliest ending flash sale if any */}
          {products.some(product => isFlashSaleActive(product)) && (
            <div className="flex items-center justify-center lg:justify-end space-x-4">
              <div className="text-gray-600 font-semibold">Flash Sale Ending:</div>
              <CountdownTimer endDate={products.find(p => isFlashSaleActive(p))?.flashSale.endDate} />
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => {
            const flashSaleActive = isFlashSaleActive(product);
            const discountedPrice = calculateDiscountedPrice(product);
            const timeLeft = flashSaleActive ? calculateTimeLeft(product.flashSale.endDate) : { expired: true };
            const savings = product.price - discountedPrice;

            return (
              <div key={product._id} className="group">
                <Link href={`/products/${product.slug}`}>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden group-hover:shadow-xl transition-all duration-300 border-2 border-green-100">
                    {/* Product Image */}
                    <div className="relative h-64 bg-gray-100">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                      
                      {/* Flash Sale Badge */}
                      {flashSaleActive && (
                        <div className="absolute top-3 left-3">
                          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            ⚡ {product.flashSale.discountPercentage}% OFF
                          </div>
                        </div>
                      )}

                      {/* Food Badge */}
                      <div className="absolute top-3 right-3">
                        <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                          FOOD
                        </div>
                      </div>

                      {/* Fresh Badge for new arrivals */}
                      {new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                        <div className="absolute bottom-3 left-3">
                          <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                            FRESH
                          </div>
                        </div>
                      )}

                      {/* Individual Product Countdown */}
                      {flashSaleActive && !timeLeft.expired && (
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg">
                            <div className="flex justify-between text-xs">
                              <span>Ends in:</span>
                              <span className="font-bold">
                                {formatTimeUnit(timeLeft.hours)}:
                                {formatTimeUnit(timeLeft.minutes)}:
                                {formatTimeUnit(timeLeft.seconds)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Stock Progress Bar */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gray-200 h-1">
                        <div 
                          className="bg-green-500 h-1 transition-all duration-500"
                          style={{ 
                            width: `${Math.min((product.numberSold / (product.stock + product.numberSold)) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-3 text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {flashSaleActive ? (
                            <>
                              <span className="text-xl font-bold text-green-600">
                                ${discountedPrice.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                ${product.price.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-gray-900">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {flashSaleActive && (
                          <div className="text-xs text-red-600 font-semibold">
                            Save ${savings.toFixed(2)}
                          </div>
                        )}
                      </div>

                      {/* Rating */}
                      {product.ratings?.average > 0 && (
                        <div className="flex items-center space-x-1 mb-3">
                          <div className="text-yellow-500">★</div>
                          <span className="text-sm text-gray-600">
                            {product.ratings.average.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-400">
                            ({product.ratings.count})
                          </span>
                        </div>
                      )}

                      {/* Stock and Sales Info */}
                      <div className="flex justify-between text-xs text-gray-500 mb-4">
                        <span>
                          {product.stock > 0 ? (
                            <span className="text-green-600">✓ In Stock</span>
                          ) : (
                            <span className="text-red-600">✗ Out of Stock</span>
                          )}
                        </span>
                        <span>{product.numberSold || 0} sold</span>
                      </div>

                      {/* Add to Cart Button */}
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          // Add to cart logic here
                          console.log('Add to cart:', product._id);
                        }}
                        disabled={product.stock === 0}
                        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <span>🛒</span>
                        <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* View All Food Button */}
        {products.length > 0 && (
          <div className="text-center mt-12">
            <Link 
              href="/products?section=food"
              className="inline-flex items-center px-8 py-4 border-2 border-green-500 text-lg font-bold rounded-lg text-green-600 hover:bg-green-500 hover:text-white transition-all duration-200 group"
            >
              Explore More Food
              <svg 
                className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}