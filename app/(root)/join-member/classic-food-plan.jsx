"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';

export default function ClassicFoodPlan() {
  const classicPlan = {
    name: "CLASSIC FOOD PLAN",
    boards: [
      {
        name: "Level 1",
        level: "First Board",
        requirements: "7 direct members",
        earnings: [
          "₦12,500 cash back (Cash Wallet)",
          "Access to Level 2"
        ],
        color: "bg-amber-100",
        border: "border-amber-300",
        icon: "🥉"
      },
      {
        name: "Level 2",
        level: "Second Board",
        requirements: "7 direct + 49 indirect members",
        earnings: [
          "Total: ₦1,200,000",
          "Premium Food Plan Auto Registration: ₦48,000",
          "Food Wallet: ₦300,000 (6 months supply)",
          "Gadget Wallet: ₦140,000",
          "Cash Wallet: ₦200,000",
          "CSR Donation: ₦12,000",
          "HSF: ₦500,000",
          "Access to Level 3"
        ],
        color: "bg-gray-100",
        border: "border-gray-300",
        icon: "🥈"
      },
      {
        name: "Level 3",
        level: "Third Board",
        requirements: "7 direct + 49 indirect members",
        earnings: [
          "Total: ₦12,000,000",
          "Food Wallet: ₦4,000,000 (20 months supply)",
          "Gadget Wallet: ₦1,000,000",
          "Cash Wallet: ₦1,000,000",
          "Car Incentive: ₦5,000,000",
          "HSF: ₦1,000,000",
          "Access to Level 4"
        ],
        color: "bg-yellow-100",
        border: "border-yellow-300",
        icon: "🥇"
      },
      {
        name: "Level 4",
        level: "Fourth Board",
        requirements: "7 direct + 49 indirect members",
        earnings: [
          "Total: ₦30,000,000",
          "Food Wallet: ₦6,000,000 (20 months supply)",
          "Gadget Wallet: ₦2,000,000",
          "Cash Wallet: ₦5,000,000",
          "Car Incentive: ₦10,000,000",
          "International Travel: ₦5,000,000",
          "HSF: ₦2,000,000"
        ],
        color: "bg-blue-100",
        border: "border-blue-300",
        icon: "💎"
      }
    ]
  };

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-gray-900 sm:text-5xl"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-600">
              Classic Food Plan
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Gold-tier rewards with our 4-level compensation plan
          </motion.p>
        </div>

        {/* Registration Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-amber-400 mb-16"
        >
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Start Earning Big</h2>
            <p className="text-amber-100 mt-1">Register for the Classic Food Plan</p>
          </div>
          <div className="px-8 py-6 bg-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Classic Food Plan</h3>
                <p className="text-gray-600 mt-1">Premium rewards with our gold-tier plan</p>
                <div className="mt-4 text-amber-600 font-bold text-xl">₦35,000 Registration</div>
              </div>
              <Button 
                href="/register/classic" 
                className="inline-flex items-center justify-center px-8 py-6 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 md:py-6 md:text-lg md:px-10 transition-all duration-200 hover:shadow-lg"
              >
                Join Classic Plan
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Board Progression */}
        <div className="mb-20" ref={ref}>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl font-bold text-center text-gray-900 mb-12"
          >
            Compensation <span className="text-amber-600">Structure</span>
          </motion.h2>
          
          {/* Connecting Line Container */}
          <div className="relative">
            {/* Horizontal Connecting Line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block absolute h-1 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 top-1/2 left-16 right-16 -translate-y-1/2 rounded-full"
              style={{ originX: 0 }}
            />
            
            {/* Board Grid */}
            <motion.div 
              variants={container}
              initial="hidden"
              animate={inView ? "show" : ""}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10"
            >
              {classicPlan.boards.map((board, index) => (
                <motion.div 
                  key={index}
                  variants={item}
                  className={`relative rounded-xl overflow-hidden border-2 ${board.border} bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}
                >
                  {/* Board Header */}
                  <div className={`px-6 py-5 ${board.color} border-b-2 ${board.border}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{board.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{board.name}</h3>
                        <p className="text-sm font-medium text-gray-700">{board.level}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Board Content */}
                  <div className="px-6 py-5">
                    <div className="mb-5">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Requirements</h4>
                      <p className="mt-1 text-gray-700 font-medium">{board.requirements}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Rewards</h4>
                      <ul className="space-y-3">
                        {board.earnings.map((item, i) => (
                          <motion.li 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={inView ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.6 + (index * 0.1) + (i * 0.05) }}
                            className="flex items-start"
                          >
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-700">{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Progress Indicator (mobile) */}
                  {index < classicPlan.boards.length - 1 && (
                    <div className="lg:hidden absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="h-8 w-8 flex items-center justify-center bg-white rounded-full border-2 border-gray-300 shadow-md">
                        <svg className="h-5 w-5 text-amber-600 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready for Gold-Level Rewards?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join the Classic Food Plan and earn up to ₦30,000,000 in rewards
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              href="/register/classic" 
              className="inline-flex items-center justify-center px-8 py-6 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 md:py-6 md:text-lg md:px-10 transition-all duration-200 hover:shadow-lg"
            >
              Join Classic Plan Now
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}