"use client"

import { ProductCard } from "@/components/account/product-card";
import Link from "next/link";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function NewArrivals() {
    const [newArrivals, setNewArrivals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNewArrivals = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/product/new-arrival?limit=8');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                if (!data.success) {
                    throw new Error(data.error || "Failed to fetch new arrivals");
                }

                setNewArrivals(data.data);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching new arrivals:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNewArrivals();
    }, []);

    if (error) {
        return (
            <section className="bg-secondary/30 py-6 md:py-8">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">New Arrivals</h2>
                        <Button asChild variant="outline">
                            <Link href="/category">View All</Link>
                        </Button>
                    </div>
                    <div className="text-center text-red-500 py-8">
                        Error: {error}
                        <Button 
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="ml-4"
                        >
                            Retry
                        </Button>
                    </div>
                </div>
            </section>
        );
    }

    if (loading) {
        return (
            <section className="bg-secondary/30 py-6 md:py-8">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">New Arrivals</h2>
                        <Button asChild variant="outline" disabled>
                            <Link href="/category">View All</Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-[200px] w-full rounded-lg" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-secondary/30 py-6 md:py-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">New Arrivals</h2>
                    <Button asChild variant="outline">
                        <Link href="/category">View All</Link>
                    </Button>
                </div>
                {newArrivals.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                        {newArrivals.map((product) => (
                            <ProductCard key={product._id || product.slug} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        No new arrivals found
                    </div>
                )}
            </div>
        </section>
    );
}