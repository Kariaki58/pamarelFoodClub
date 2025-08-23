import { NewArrivals } from "@/components/account/new-arrivals";
import { BestRatedProducts } from "@/components/account/best-rated-products";
import { CategorySection } from "@/components/account/category-section";
import { DailyEssentials } from "@/components/account/daily-essentials";
import { DealsByCategory } from "@/components/account/deals-by-category";
import { FlashSales } from "@/components/account/flash-sales";
import { HeroSection } from "@/components/account/hero-section";
import TopDeals from "@/components/account/top-deals";
import { GadgetEssentails } from "@/components/account/gadget-essentails";
import { EarnWithUsSection } from "@/components/account/EarnWithUsSection";


export default function MarketHub() {
    return (
        <div>
            <HeroSection />
            {/* <EarnWithUsSection /> */}
            <div className="container mx-auto px-4 md:px-6">
                <CategorySection />
            </div>
            <FlashSales />
            <TopDeals />
            <DailyEssentials />
            <GadgetEssentails />
            
            <DealsByCategory />
            <BestRatedProducts />
            {/* <NewArrivals /> */}
        </div>
    )
}