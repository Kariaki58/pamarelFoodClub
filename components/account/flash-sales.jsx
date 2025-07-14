"use client";

import { useState, useEffect } from "react";
import { products } from "@/lib/mock-data";
import { ProductCard } from "./product-card";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const Countdown = () => {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            
            const difference = endOfDay.getTime() - now.getTime();
            
            let timeLeft = {};
            
            if (difference > 0) {
                timeLeft = {
                    hours: Math.floor((difference / (1000 * 60 * 60))),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
            }
            return timeLeft;
        };
        
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        // Initial call
        setTimeLeft(calculateTimeLeft());
        
        return () => clearInterval(timer);
    }, []);

    const formatTime = (time) => time.toString().padStart(2, '0');

    return (
        <div className="flex items-center gap-2">
            <span className="rounded-md bg-destructive px-2 py-1 text-sm font-semibold text-destructive-foreground">
                {formatTime(timeLeft.hours)}
            </span>
            <span>:</span>
            <span className="rounded-md bg-destructive px-2 py-1 text-sm font-semibold text-destructive-foreground">
                {formatTime(timeLeft.minutes)}
            </span>
            <span>:</span>
            <span className="rounded-md bg-destructive px-2 py-1 text-sm font-semibold text-destructive-foreground">
                {formatTime(timeLeft.seconds)}
            </span>
        </div>
    );
};

export function FlashSales() {
    const flashSaleProducts = products.filter(p => p.originalPrice).slice(0, 10);

    return (
        <section className="bg-secondary/50 py-6 md:py-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex items-center gap-4">
                        <Zap className="h-8 w-8 text-destructive" />
                        <h2 className="text-2xl font-bold">Flash Sales</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">Time Left:</span>
                        <Countdown />
                    </div>
                </div>
                <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex w-max space-x-4 pb-4">
                        {flashSaleProducts.map((product) => (
                            <div key={product.id} className="w-[220px] md:w-[250px]">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </section>
    );
}
