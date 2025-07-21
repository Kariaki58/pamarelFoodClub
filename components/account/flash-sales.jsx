"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "./product-card";
import { Zap } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "../ui/skeleton";

const Countdown = ({ endDate }) => {
    const [timeLeft, setTimeLeft] = useState({ 
        hours: 0, 
        minutes: 0, 
        seconds: 0 
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = endDate.getTime() - now.getTime();
            
            let timeLeft = {
                hours: 0,
                minutes: 0,
                seconds: 0
            };
            
            if (difference > 0) {
                timeLeft = {
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
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
    }, [endDate]);

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
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [earliestEndDate, setEarliestEndDate] = useState(null);

    useEffect(() => {
        const fetchFlashSaleProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/product/flash-sales/showcase');
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch flash sale products');
                }
                
                setProducts(data.products);
                
                // Find the earliest ending flash sale for the countdown
                if (data.products && data.products.length > 0) {
                    const endDates = data.products.map(p => new Date(p.flashSale.end));
                    const earliestEnd = new Date(Math.min(...endDates.map(date => date.getTime())));
                    setEarliestEndDate(earliestEnd);
                }
            } catch (err) {
                setError(err.message);
                console.error("Error fetching flash sales:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFlashSaleProducts();
    }, []);

    if (error) {
        return (
            <section className="bg-secondary/50 py-6 md:py-8">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center text-destructive">
                        Error loading flash sales: {error}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-secondary/50 py-6 md:py-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex items-center gap-4">
                        <Zap className="h-8 w-8 text-destructive" />
                        <h2 className="text-2xl font-bold">Flash Sales</h2>
                    </div>
                    {earliestEndDate && (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">Time Left:</span>
                            <Countdown endDate={earliestEndDate} />
                        </div>
                    )}
                </div>
                
                {loading ? (
                    <div className="flex w-max space-x-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-[220px] md:w-[250px] space-y-3">
                                <Skeleton className="h-[200px] w-full rounded-lg" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : products && products.length > 0 ? (
                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex w-max space-x-4 pb-4">
                            {products.map((product) => (
                                <div key={product._id} className="w-[220px] md:w-[250px]">
                                    <ProductCard 
                                        product={{
                                            ...product,
                                            originalPrice: product.price,
                                            price: product.discountPrice,
                                            image: product.images[0]?.url
                                        }} 
                                    />
                                </div>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No active flash sales at the moment</p>
                    </div>
                )}
            </div>
        </section>
    );
}