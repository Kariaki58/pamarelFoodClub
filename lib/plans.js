export const PLANS = {
  basic: {
    name: "BASIC FOOD PLAN",
    price: 4000,
    color: "green",
    boards: [
      {
        name: "Bronze Board",
        level: "Level 1",
        requirements1: "7 Team members",
        requirements2: "",
        earnings: [
          "₦13,000 FOODY BAG",
          "Access to Silver Board"
        ],
        color: "bg-green-100",
        border: "border-green-300",
        icon: "🥉"
      },
      {
        name: "Silver Board",
        level: "Levels 1-2",
        requirements1: "7 Team members",
        requirement2: "7X7 (49 Team members)",
        earnings: [
          "Total: ₦100,000 - ₦110,000",
          "Food Wallet: ₦30,000",
          "Gadgets Wallet: ₦10,000",
          "Cash Wallet: ₦20,000",
          "CSR Donation : ₦5,000",
          "Arising Leader Bonus (Complete your Silver Board within 30 days to qualify) : Mini Breakfast Fody Bag valued at ₦10,000",
          "Automatic registration into CLASSIC FOOD PLAN",
          "Access to Gold Board"
        ],
        color: "bg-gray-100",
        border: "border-gray-300",
        icon: "🥈"
      },
      {
        name: "Gold Board",
        level: "Levels 1-2",
        requirements1: "7 Team members",
        requirement2: "7X7 (49 Team members)",
        earnings: [
          "Total: ₦1,300,000",
          "Food Wallet: ₦300,000 (₦100,000 monthly food supplies for 3 months)",
          "Gadgets Wallet: ₦120,000",
          "Cash Wallet: ₦300,000",
          "Automatic Registration into DELUXE FOOD PLAN : ₦80,000",
          "HSF Project :  ₦500.000",
          // "Access to Platinum Board"
        ],
        color: "bg-yellow-100",
        border: "border-yellow-300",
        icon: "🥇"
      },
    ]
  },
  classic: {
    name: "CLASSIC FOOD PLAN",
    price: 35000,
    color: "purple",
    boards: [
      {
        name: "Bronze Board",
        level: "Level 1",
        requirements1: "7 Team members",
        earnings: [
          "Total: ₦120,000",
          "Foody Bag: ₦40,000",
          "Gadgets Wallet: ₦20,000",
          "Cash Wallet: ₦35,000",
          "CSR Donation: ₦10,000",
          "Arising Leader Bonus (complete within 30 days): Mini Breakfast Foody Bag valued at ₦15,000"
        ],
        color: "bg-purple-100",
        border: "border-purple-300",
        icon: "🥉"
      },
      {
        name: "Silver Board",
        level: "Level 2",
        requirements1: "7 Team members",
        requirement2: "7X7 (49 Team members)",
        earnings: [
          "Total: ₦530,000",
          "Food Wallet: ₦300,000 (₦100,000 monthly supplies for 3 months)",
          "Gadgets Wallet: ₦50,000",
          "Cash Wallet: ₦100,000",
          "Automatic Registration into Deluxe Food Plan: ₦80,000"
        ],
        color: "bg-gray-100",
        border: "border-gray-300",
        icon: "🥈"
      },
      {
        name: "Gold Board",
        level: "Level 3",
        requirements1: "7 Team members",
        requirement2: "7X7 (49 Team members)",
        earnings: [
          "Total: ₦20,000,000",
          "Food Wallet: ₦2,000,000 (₦200,000 monthly supplies for 10 months)",
          "Gadgets Wallet: ₦2,000,000",
          "Cash Wallet: ₦5,000,000",
          "Car Award: ₦8,000,000",
          "HSF Project: ₦3,000,000"
        ],
        color: "bg-yellow-100",
        border: "border-yellow-300",
        icon: "🥇"
      },
    ]
  },
  deluxe: {
    name: "DELUXE FOOD PLAN",
    price: 80000,
    color: "gray",
    boards: [
      {
        name: "Bronze Board",
        level: "Level 1",
        requirements1: "7 Team members",
        earnings: [
          "Total: ₦200,000",
          "Foody Bag: ₦60,000",
          "Gadgets Wallet: ₦20,000",
          "Cash Wallet: ₦80,000",
          "CSR Donation: ₦20,000",
          "Arising Leader Bonus (complete within 30 days): Mini Breakfast Foody Bag valued at ₦20,000"
        ],
        color: "bg-gray-100",
        border: "border-gray-300",
        icon: "🥉"
      },
      {
        name: "Silver Board",
        level: "Level 2",
        requirements1: "7 Team members",
        requirement2: "7X7 (49 Team members)",
        earnings: [
          "Total: ₦1,700,000",
          "Food Wallet: ₦600,000 (₦200,000 monthly supplies for 3 months)",
          "Gadgets Wallet: ₦400,000",
          "Cash Wallet: ₦500,000"
        ],
        color: "bg-gray-800",
        border: "border-gray-900",
        icon: "🥈"
      },
      {
        name: "Gold Board",
        level: "Level 3",
        requirements1: "7 Team members",
        requirement2: "7X7 (49 Team members)",
        earnings: [
          "Total: ₦35,000,000",
          "Food Wallet: ₦3,000,000 (₦300,000 monthly supplies for 10 months)",
          "Gadgets Wallet: ₦3,000,000",
          "Cash Wallet: ₦6,000,000",
          "Car Award: ₦10,000,000",
          "HSF Project: ₦5,000,000",
          "African Country Trip: ₦8,000,000"
        ],
        color: "bg-gray-900",
        border: "border-black",
        icon: "🥇"
      },
    ]
  }
};