import { ProductCard } from "@/components/account/product-card";
import { products } from "@/lib/mock-data";
import Link from "next/link";
import { Button } from "../ui/button";

export function BestRatedProducts() {
    const bestRatedProducts = [...products].sort((a, b) => b.rating - a.rating).slice(0, 8);

    return (
        <section className="container mx-auto px-4 py-6 md:px-6 md:py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Best Rated Products</h2>
                <Button asChild variant="outline">
                    <Link href="/category">View All</Link>
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {bestRatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
            </div>
        </section>
    );
}
