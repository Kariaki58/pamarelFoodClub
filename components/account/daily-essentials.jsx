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
                const response = await fetch('/api/product/section/food');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setDailyEssentialsProducts(data.products.slice(0, 8));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return <div className="container mx-auto px-4 py-6">Loading...</div>;
    }

    if (error) {
        return <div className="container mx-auto px-4 py-6 text-red-500">Error: {error}</div>;
    }

    if (dailyEssentialsProducts.length == 0) {
        return (<div></div>)
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
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}