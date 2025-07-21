"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ProductCard } from './product-card';

export default function TopDeals() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTopDeals = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/product/top-deals');
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch top deals');
                }
                
                setProducts(data.products);
            } catch (err) {
                setError(err.message);
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTopDeals();
    }, []);

    if (error) {
        return (
            <section className="container mx-auto px-4 py-6 md:px-6 md:py-8">
                <div className="text-center text-red-500">
                    Error loading top deals: {error}
                </div>
            </section>
        );
    }

    return (
        <section className="container mx-auto px-4 py-6 md:px-6 md:py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Top Deals</h2>
                <Button asChild variant="outline">
                    <Link href="/category">View All</Link>
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="h-64 bg-gray-200 rounded-lg"></div>
                            <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="mt-1 h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500">No top deals available at the moment</p>
                </div>
            )}
        </section>
    );
}