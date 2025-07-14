import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "../ui/button";

export function CategorySection() {
  return (
    <section className="py-6 md:py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Shop by Category</h2>
        <Button asChild variant="ghost" className="hidden md:flex">
          <Link href="/category">
            See All Categories <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link href={`/category?cat=${category.slug}`} key={category.id} className="group">
            <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 h-full">
              <CardContent className="flex flex-col items-center p-4 text-center">
                <div className="relative h-32 w-32 mb-4">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-contain"
                    data-ai-hint={category.name}
                  />
                </div>
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground flex-grow">{category.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Mobile Horizontal Scroll */}
      <div className="md:hidden">
          <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex w-max space-x-4 pb-4">
                  {categories.map((category) => (
                       <Link href={`/category?cat=${category.slug}`} key={category.id} className="group">
                           <Card className="overflow-hidden w-[200px] sm:w-[250px] h-full">
                               <CardContent className="flex flex-col items-center p-4 text-center">
                                   <div className="relative h-24 w-24 mb-3">
                                        <Image
                                            src={category.imageUrl}
                                            alt={category.name}
                                            fill
                                            className="object-contain"
                                            data-ai-hint={category.slug.replace('-', ' ')}
                                        />
                                   </div>
                                   <h3 className="text-md font-semibold truncate w-full">{category.name}</h3>
                                   <p className="mt-1 text-xs text-muted-foreground h-10">{category.description}</p>
                               </CardContent>
                           </Card>
                       </Link>
                  ))}
              </div>
              <ScrollBar orientation="horizontal" />
          </ScrollArea>
      </div>
    </section>
  );
}
