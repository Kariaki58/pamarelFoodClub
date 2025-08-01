"use client";

import { useState } from 'react';
import BasicFoodPlan from "./basic-food-plan";
import ClassicFoodPlan from "./classic-food-plan";
import PremiumFoodPlan from "./premium-food-plan";
import { motion } from 'framer-motion';

export default function JoinMember() {
  const [activeTab, setActiveTab] = useState('basic');

  const tabs = [
    { id: 'basic', label: 'Basic Plan', color: 'from-amber-400 to-amber-500' },
    { id: 'classic', label: 'Classic Plan', color: 'from-amber-500 to-amber-600' },
    { id: 'premium', label: 'Premium Plan', color: 'from-gray-700 to-gray-900' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4"
          >
            Choose Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-600">Food Plan</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Select the plan that matches your goals and start earning rewards today
          </motion.p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-xl bg-gray-200 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 rounded-lg text-sm font-medium transition-colors focus:outline-none ${
                  activeTab === tab.id 
                    ? 'text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="activeTab"
                    className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-lg`}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {activeTab === 'basic' && <BasicFoodPlan />}
          {activeTab === 'classic' && <ClassicFoodPlan />}
          {activeTab === 'premium' && <PremiumFoodPlan />}
        </motion.div>

        {/* Comparison CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Not sure which plan is right for you?</h2>
          <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
            Compare all plans to see which one matches your goals
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <button
              onClick={() => {
                // Scroll to comparison section or open modal
                document.getElementById('plan-comparison')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all duration-200 hover:shadow-lg"
            >
              Compare All Plans
            </button>
          </motion.div>
        </motion.div>

        {/* Plan Comparison Section */}
        <div id="plan-comparison" className="mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Plan Comparison</h2>
          
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              {/* Header Row */}
              <div className="p-6 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Features</h3>
              </div>
              <div className="p-6 bg-amber-50">
                <h3 className="text-lg font-bold text-amber-800 mb-2">Basic</h3>
                <p className="text-amber-600 font-medium">₦4,000</p>
              </div>
              <div className="p-6 bg-amber-100">
                <h3 className="text-lg font-bold text-amber-900 mb-2">Classic</h3>
                <p className="text-amber-700 font-medium">₦25,000</p>
              </div>
              <div className="p-6 bg-gray-800 text-white">
                <h3 className="text-lg font-bold mb-2">Premium</h3>
                <p className="text-gray-300 font-medium">₦80,000</p>
              </div>

              {/* Comparison Rows */}
              {[
                { feature: "Registration Fee", basic: "₦4,000", classic: "₦25,000", premium: "₦80,000" },
                { feature: "Max Potential Earnings", basic: "₦14,000,000", classic: "₦30,000,000", premium: "₦100,000,000" },
                { feature: "Food Wallet", basic: "Yes", classic: "Yes", premium: "Yes" },
                { feature: "Cash Wallet", basic: "Yes", classic: "Yes", premium: "Yes" },
                { feature: "Gadget Wallet", basic: "Yes", classic: "Yes", premium: "Yes" },
                { feature: "Car Incentive", basic: "Platinum Only", classic: "Levels 3-4", premium: "Levels 2-4" },
                { feature: "International Travel", basic: "No", classic: "Level 4", premium: "Levels 3-4" },
                { feature: "Housing Incentive", basic: "No", classic: "No", premium: "Level 4" },
              ].map((row, index) => (
                <div key={index} className="contents group">
                  <div className="p-4 bg-gray-50 group-hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-700">{row.feature}</p>
                  </div>
                  <div className="p-4 bg-white group-hover:bg-amber-50 transition-colors">
                    <p className="text-gray-800">{row.basic}</p>
                  </div>
                  <div className="p-4 bg-white group-hover:bg-amber-100 transition-colors">
                    <p className="text-gray-800">{row.classic}</p>
                  </div>
                  <div className="p-4 bg-gray-900 group-hover:bg-gray-800 transition-colors">
                    <p className="text-gray-200">{row.premium}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}