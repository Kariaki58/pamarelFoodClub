import { ProductCard } from "@/components/account/product-card";
import { products } from "@/lib/mock-data";
import Link from "next/link";
import { Button } from "../ui/button";

export function ForKidsSection() {
    const forKidsProducts = products.filter(p => p.category === 'Play & Learn Materials').slice(0, 8);

    if (forKidsProducts.length === 0) return null;

    return (
        <section className="container mx-auto px-4 py-6 md:px-6 md:py-8 bg-rose-50 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-rose-600">For Kids / Play & Learn</h2>
                <Button asChild variant="outline" className="border-rose-300 text-rose-600 hover:bg-rose-100 hover:text-rose-700">
                    <Link href="/category?cat=play-learn">View All</Link>
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {forKidsProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
            </div>
        </section>
    );
}
