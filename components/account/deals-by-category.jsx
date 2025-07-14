"use client"

import { ProductCard } from "@/components/account/product-card";
import { products, categories } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function DealsByCategory() {
    const categoriesToShow = categories.slice(0, 6);

    return (
        <section className="bg-secondary/30 py-6 md:py-8">
            <div className="container mx-auto px-4 md:px-6">
                <h2 className="text-2xl font-bold mb-6 text-center">Deals by Category</h2>
                <Tabs defaultValue={categoriesToShow[0].slug} className="w-full">
                    <div className="flex justify-center">
                        <ScrollArea className="w-auto max-w-full whitespace-nowrap pb-2">
                             <TabsList>
                                {categoriesToShow.map(category => (
                                    <TabsTrigger key={category.id} value={category.slug}>{category.name}</TabsTrigger>
                                ))}
                            </TabsList>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    </div>
                    {categoriesToShow.map(category => {
                        const categoryProducts = products.filter(p => p.category === category.name).slice(0, 10);
                        return (
                            <TabsContent key={category.id} value={category.slug}>
                                <ScrollArea className="w-full whitespace-nowrap mt-6">
                                    <div className="flex w-max space-x-2 pb-4">
                                        {categoryProducts.map((product) => (
                                            <div key={product.id} className="w-[220px] md:w-[250px]">
                                                <ProductCard product={product} />
                                            </div>
                                        ))}
                                    </div>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>
                            </TabsContent>
                        )
                    })}
                </Tabs>
            </div>
        </section>
    );
}
