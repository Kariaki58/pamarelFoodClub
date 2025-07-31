"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function EarnWithUsSection() {
  return (
    <section className="w-full bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12">
          <div className="flex-1 w-full">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-lg">
              <Image
                src="/plo.jpg" 
                alt="mlm test" 
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Build Your Network, Grow Your Income
            </h2>
            <p className="text-lg text-gray-700">
              Pamarel rewards you at every level. Earn commissions not just from your sales, 
              but from your entire network's performance through our powerful MLM system.
            </p>
            
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-xl font-semibold text-primary">Your Earning Potential</h3>
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded border p-3 text-center">
                  <div className="text-2xl font-bold">Level 1</div>
                  <div className="text-sm">7 members</div>
                  <div className="mt-2 font-medium">₦13,000 FOODY BAG</div>
                </div>
                <div className="rounded border p-3 text-center">
                  <div className="text-2xl font-bold">Level 2</div>
                  <div className="text-sm">49 members</div>
                  <div className="mt-2 font-medium">₦100, 000 - ₦110,000</div>
                </div>
                <div className="rounded border p-3 text-center">
                  <div className="text-2xl font-bold">Level 3</div>
                  <div className="text-sm">343 members</div>
                  <div className="mt-2 font-medium"> ₦1,300,000</div>
                </div>
                <div className="rounded border p-3 text-center">
                  <div className="text-2xl font-bold">Level 4</div>
                  <div className="text-sm">2,401 members</div>
                  <div className="mt-2 font-medium">₦14,000,000</div>
                </div>
              </div>
            </div>

            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <svg className="mr-2 h-5 w-5 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Earn from multiple levels of your network</span>
              </li>
              <li className="flex items-start">
                <svg className="mr-2 h-5 w-5 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Weekly withdrawals to your bank account</span>
              </li>
              <li className="flex items-start">
                <svg className="mr-2 h-5 w-5 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Real-time tracking of your earnings</span>
              </li>
            </ul>
            
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild className="bg-primary px-8 py-6 text-lg hover:bg-primary/90">
                <Link href="/register">Join Now</Link>
              </Button>
              <Button asChild variant="outline" className="px-8 py-6 text-lg">
                <Link href="/compensation-plan">See Full Compensation Plan</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}