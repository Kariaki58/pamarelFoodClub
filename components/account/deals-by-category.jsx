"use client"

import { ProductCard } from "@/components/account/product-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function DealsByCategory() {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/deals-by-category');
        const data = await response.json();
        console.log({ data })
        
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch data");
        }

        const categoriesData = data.data.map(item => item.category);
        const productsData = data.data.reduce((acc, item) => {
          acc[item.category.slug] = item.products;
          return acc;
        }, {});

        setCategories(categoriesData.slice(0, 6));
        setProductsByCategory(productsData);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <section className="bg-secondary/30 py-6 md:py-8">
        <div className="container mx-auto px-4 md:px-6 text-center text-red-500">
          Error: {error}
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="bg-secondary/30 py-6 md:py-8">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Deals by Category</h2>
          <div className="flex justify-center">
            <ScrollArea className="w-auto max-w-full whitespace-nowrap pb-2">
              <div className="flex space-x-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-24 rounded-full" />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
          <div className="mt-6">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex w-max space-x-2 pb-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-[220px] md:w-[250px]">
                    <Skeleton className="h-[300px] w-full rounded-lg" />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-secondary/30 py-6 md:py-8">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Deals by Category</h2>
        {categories.length > 0 ? (
          <Tabs defaultValue={categories[0].slug} className="w-full">
            <div className="flex justify-center">
              <ScrollArea className="w-auto max-w-full whitespace-nowrap pb-2">
                <TabsList>
                  {categories.map(category => (
                    <TabsTrigger key={category.slug} value={category.slug}>
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
            {categories.map(category => (
              <TabsContent key={category.slug} value={category.slug}>
                <ScrollArea className="w-full whitespace-nowrap mt-6">
                  <div className="flex w-max space-x-2 pb-4">
                    {productsByCategory[category.slug]?.length > 0 ? (
                      productsByCategory[category.slug].map((product) => (
                        <div key={product.slug} className="w-[220px] md:w-[250px]">
                          <ProductCard product={product} />
                        </div>
                      ))
                    ) : (
                      <div className="text-center w-full py-8">
                        No products found in this category
                      </div>
                    )}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-8">No categories found</div>
        )}
      </div>
    </section>
  );
}