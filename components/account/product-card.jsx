"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/cart-provider";
import { formatPrice } from "@/lib/utils";


export function ProductCard({ product }) {
  const { addToCart } = useCart();
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  }





  console.log(product)

  return (
    <Link href={`/product/${product._id}`} className="group relative block h-full">
        <Card className="flex h-full flex-col p-0 overflow-hidden transition-transform duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
        <CardContent className="flex flex-1 flex-col p-0">
            <div className="relative w-full aspect-square">
            <Image
                src={product.images[0].url}
                alt={product.name}
                fill
                className="object-cover"
                data-ai-hint="product image"
            />
            {discount > 0 && (
                <div className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                -{discount}%
                </div>
            )}
            </div>
            <div className="flex flex-1 flex-col justify-between p-3">
              <div>
                <h3 className="font-semibold text-sm leading-tight truncate">{product.name}</h3>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{product.rating}</span>
                    {/* <span className="hidden sm:inline">({product.reviewCount})</span> */}
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-baseline gap-2">
                    <p className="text-base font-bold text-primary">₦{formatPrice(product.price)}</p>
                    {product.originalPrice && (
                    <p className="text-xs text-muted-foreground line-through">₦{formatPrice(product.originalPrice)}</p>
                    )}
                </div>
                 <Button size="sm" className="w-full mt-2 p-4 bg-yellow-500 text-black hover:bg-yellow/90" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
              </div>
            </div>
        </CardContent>
        </Card>
    </Link>
  );
}
