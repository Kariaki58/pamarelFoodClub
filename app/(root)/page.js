import { NewArrivals } from "@/components/account/new-arrivals";
import { products } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BestRatedProducts } from "@/components/account/best-rated-products";
import { CategorySection } from "@/components/account/category-section";
import { ProductCard } from "@/components/account/product-card";
import { DailyEssentials } from "@/components/account/daily-essentials";
import { DealsByCategory } from "@/components/account/deals-by-category";
import { FlashSales } from "@/components/account/flash-sales";
import { ForKidsSection } from "@/components/account/for-kids-section";
import { HeroSection } from "@/components/account/hero-section";

export default function Home() {
  const topDeals = products.slice(0, 12);

  return (
    <>
      <HeroSection />
      <div className="container mx-auto px-4 md:px-6">
        <CategorySection />
      </div>
      <FlashSales />
       <section className="container mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Top Deals</h2>
            <Button asChild variant="outline">
                <Link href="/category">View All</Link>
            </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          {topDeals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      <DailyEssentials />
      <DealsByCategory />
      <ForKidsSection />
      <BestRatedProducts />
      <NewArrivals />
    </>
  );
}
