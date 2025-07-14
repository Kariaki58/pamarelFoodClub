
"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { products } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Star, Plus, Minus, ShoppingCart, Truck, ShieldCheck, Heart, Share2, Store } from 'lucide-react';
// import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/cart-provider';
import { notFound } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
// import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ProductCard } from '@/components/account/product-card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

function ReviewStars({ rating }) {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );
}

function ReviewList({ reviews }) {
    if (!reviews || reviews.length === 0) {
        return <p className="text-muted-foreground text-center py-8">No reviews yet for this product.</p>;
    }

    const ratingDistribution = reviews.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
    }, {});

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-4">
                <h3 className="text-lg font-semibold">Customer Reviews</h3>
                <div className="flex items-center gap-2">
                    <ReviewStars rating={averageRating} />
                    <span className="font-bold text-2xl">{averageRating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">out of 5</span>
                </div>
                <p className="text-sm text-muted-foreground">{totalReviews} customer ratings</p>
                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(star => {
                        const count = ratingDistribution[star] || 0;
                        const percentage = (count / totalReviews) * 100;
                        return (
                            <div key={star} className="flex items-center gap-2 text-sm">
                                <span>{star} star</span>
                                <Progress value={percentage} className="w-full h-2" />
                                <span>{percentage.toFixed(0)}%</span>
                            </div>
                        )
                    })}
                </div>
                <Separator />
                <h4 className="font-semibold">Write a review</h4>
                <p className="text-sm text-muted-foreground">Share your thoughts with other customers</p>
                <Button variant="outline">Write a customer review</Button>
            </div>
            <div className="md:col-span-2 space-y-6">
                 {reviews.map(review => (
                    <div key={review.id} className="flex gap-4">
                        <Avatar>
                            <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold">{review.author}</p>
                            </div>
                            <div className="flex items-center gap-2 my-1">
                                <ReviewStars rating={review.rating} />
                                <p className="font-bold">{review.title}</p>
                            </div>
                             <p className="text-sm text-muted-foreground mb-2">Reviewed on {new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p className="text-sm text-foreground">{review.comment}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = products.find(p => p.id === id);
  const [activeImage, setActiveImage] = useState(product?.imageUrl);

  if (!product) {
    return notFound();
  }

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
  };
  
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const similarProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 6);

  const renderButtons = () => (
    <>
      <Button size="lg" className="flex-1 bg-yellow-500 text-black hover:bg-yellow/90" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-5 w-5" />
          Add to Cart
      </Button>
      <Button size="lg" className="flex-1 bg-orange-500 text-white hover:bg-amber-800">Buy Now</Button>
    </>
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      {/* Breadcrumbs would go here */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-5">
        
        {/* Left Column: Image Gallery and Delivery Info */}
        <div className="md:col-span-2 lg:col-span-3 xl:col-span-2">
           <Card>
                <CardContent className="p-4">
                    <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-lg">
                        <Image
                        src={activeImage || product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain"
                        data-ai-hint="product image"
                        />
                    </div>
                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex w-max space-x-2 pb-2">
                        {[product.imageUrl, ...(product.gallery || [])].map((img, index) => (
                        <button
                            key={index}
                            className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 ${activeImage === img ? 'border-primary' : 'border-transparent'}`}
                            onClick={() => setActiveImage(img)}
                        >
                            <Image
                            src={img}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                            data-ai-hint="product image"
                            />
                        </button>
                        ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </CardContent>
            </Card>

            <div className="mt-4 flex justify-center gap-4 text-sm text-muted-foreground">
                <button className="flex items-center gap-1 hover:text-primary">
                    <Heart className="h-4 w-4" /> Wishlist
                </button>
                <Separator orientation="vertical" className="h-5" />
                <button className="flex items-center gap-1 hover:text-primary">
                    <Share2 className="h-4 w-4" /> Share
                </button>
            </div>
            
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-xl">Delivery & Returns</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                        <Truck className="h-6 w-6 text-primary mt-1"/>
                        <div>
                            <p className="font-semibold text-foreground">Standard Delivery</p>
                            <p className="text-muted-foreground">Estimated delivery: 3 - 5 days</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Store className="h-6 w-6 text-primary mt-1"/>
                        <div>
                            <p className="font-semibold text-foreground">Shipped From</p>
                            <p className="text-muted-foreground">Nigeria</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="h-6 w-6 text-primary mt-1"/>
                        <div>
                            <p className="font-semibold text-foreground">Return Policy</p>
                            <p className="text-muted-foreground">Free returns within 7 days for official store items and 3 days for other products.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Middle Column: Product Details */}
        <div className="md:col-span-3 lg:col-span-4 xl:col-span-3 space-y-4 pb-24 md:pb-0">
          <h1 className="text-2xl font-bold lg:text-3xl">{product.name}</h1>
          <p className="text-sm text-muted-foreground">Brand: <a href="#" className="text-primary hover:underline">{product.brand}</a> | <a href="#reviews" className="hover:underline">See similar products</a></p>
          
          <div className="flex items-center gap-2">
            <ReviewStars rating={product.rating} />
            <a href="#reviews" className="text-sm text-muted-foreground hover:underline">({product.reviewCount} reviews)</a>
          </div>
          
          <Separator />
          
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-primary">₦{formatPrice(product.price)}</p>
            {product.originalPrice && (
              <p className="text-lg text-muted-foreground line-through">₦{formatPrice(product.originalPrice)}</p>
            )}
            {discount > 0 && <Badge variant="destructive">-{discount}%</Badge>}
          </div>

          <p className="text-sm text-green-600 font-semibold">In stock</p>
          
          <Separator />

          <div className="flex items-center gap-4">
            <p className="font-semibold">Quantity:</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center text-lg font-semibold">{quantity}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(quantity + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="hidden md:flex flex-row gap-4 pt-4">
            {renderButtons()}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-2 flex gap-2 z-50">
        {renderButtons()}
      </div>

      {/* Tabs */}
      <div id="reviews" className="mt-12">
        <Tabs defaultValue="description">
          <div className="flex justify-center">
            <TabsList className="overflow-x-auto overflow-y-hidden">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
            </TabsList>
          </div>
          <Card className="mt-2 rounded-t-none">
            <CardContent className="p-6">
                <TabsContent value="description" className="mt-0 text-muted-foreground prose prose-sm max-w-none">
                    <p>{product.description}</p>
                </TabsContent>
                <TabsContent value="specifications" className="mt-0">
                    <ul className="divide-y">
                        {product.specifications?.map(spec => (
                            <li key={spec.name} className="grid grid-cols-2 py-2 text-sm">
                                <span className="font-semibold text-foreground">{spec.name}</span>
                                <span className="text-muted-foreground">{spec.value}</span>
                            </li>
                        ))}
                    </ul>
                </TabsContent>
                <TabsContent value="reviews" className="mt-0 text-muted-foreground">
                    <ReviewList reviews={product.reviews || []} />
                </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>

        {/* Similar Products */}
      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold">You Might Also Like</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {similarProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
