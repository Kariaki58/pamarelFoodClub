import { ProductCard } from "@/components/account/product-card";
import { products } from "@/lib/mock-data";
import Link from "next/link";
import { Button } from "../ui/button";

export function NewArrivals() {
    const newArrivals = products.slice(-8);

    return (
        <section className="bg-secondary/30 py-6 md:py-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">New Arrivals</h2>
                    <Button asChild variant="outline">
                        <Link href="/category">View All</Link>
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                {newArrivals.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
                </div>
            </div>
        </section>
    );
}
