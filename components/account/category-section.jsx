import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "../ui/button";
import connectToDatabase from "@/lib/dbConnect";
import category from "@/models/category";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";

export async function CategorySection() {
  let categoryData = [];
  let isLoading = true;
  let error = null;

  try {
    await connectToDatabase();
    categoryData = await category.find({});
  } catch (err) {
    console.error("Failed to load categories:", err);
    error = "Failed to load categories. Please try again later.";
  } finally {
    isLoading = false;
  }

  if (isLoading) {
    return (
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <Skeleton className="h-48 w-full rounded-t-lg" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2 rounded-lg" />
                    <Skeleton className="h-4 w-full mb-1 rounded-lg" />
                    <Skeleton className="h-4 w-5/6 mb-1 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg max-w-2xl mx-auto">
            {error}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Featured Categories
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Discover our curated collections
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="md:w-auto w-full flex items-center gap-2"
          >
            <Link href="/category">
              Explore All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Desktop Grid - Enhanced Layout */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categoryData.map((category) => (
            <Link
              href={`/category?cat=${category.slug}`}
              key={category._id}
              className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg transition-all duration-300 hover:shadow-lg"
              aria-label={`Browse ${category.name} category`}
            >
              <Card className="h-full overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={category.image.url}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {category.description}
                  </p>
                  <div className="mt-4 flex items-center text-primary font-medium text-sm group-hover:underline">
                    Shop now
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="md:hidden">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-4 pb-4">
              {categoryData.map((category) => (
                <Link
                  href={`/category/${category.slug}`}
                  key={category._id}
                  className="group block w-[280px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
                  aria-label={`Browse ${category.name} category`}
                >
                  <Card className="h-full overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={category.image.url}
                        alt={category.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                        {category.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {category.description}
                      </p>
                      <div className="text-primary font-medium text-xs flex items-center">
                        View collection
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </section>
  );
}