"use client";
import { ProductCard } from "@/components/account/product-card";
import Link from "next/link";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";

export function DailyEssentials() {
    const [dailyEssentialsProducts, setDailyEssentialsProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/product/section/food');
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch products: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (!data.success) {
                    throw new Error(data.error || 'Failed to fetch products');
                }
                
                setDailyEssentialsProducts(data.products?.slice(0, 8) || []);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching daily essentials:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <section className="container mx-auto px-4 py-6 md:px-6 md:py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Daily Essentials</h2>
                    <Button asChild variant="outline">
                        <Link href="/category">View All</Link>
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="h-64 bg-gray-200 rounded-lg"></div>
                            <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="mt-1 h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="container mx-auto px-4 py-6 md:px-6 md:py-8">
                <div className="text-center text-red-500">
                    Error loading daily essentials: {error}
                </div>
            </section>
        );
    }

    if (dailyEssentialsProducts.length === 0) {
        return null; // Return nothing if no products
    }

    return (
        <section className="container mx-auto px-4 py-6 md:px-6 md:py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Daily Essentials</h2>
                <Button asChild variant="outline">
                    <Link href="/category">View All</Link>
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                {dailyEssentialsProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </section>
    );
}