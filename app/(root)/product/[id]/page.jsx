"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Star,
  Plus,
  Minus,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Heart,
  Share2,
  Store,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/context/cart-provider";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

function ReviewStars({ rating }) {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No reviews yet for this product.
      </p>
    );
  }

  const ratingDistribution = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {});

  const totalReviews = reviews.length;
  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1 space-y-4">
        <h3 className="text-lg font-semibold">Customer Reviews</h3>
        <div className="flex items-center gap-2">
          <ReviewStars rating={averageRating} />
          <span className="font-bold text-2xl">{averageRating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">out of 5</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {totalReviews} customer ratings
        </p>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDistribution[star] || 0;
            const percentage = (count / totalReviews) * 100;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span>{star} star</span>
                <Progress value={percentage} className="w-full h-2" />
                <span>{percentage.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
        <Separator />
        <h4 className="font-semibold">Write a review</h4>
        <p className="text-sm text-muted-foreground">
          Share your thoughts with other customers
        </p>
        <Button variant="outline">Write a customer review</Button>
      </div>
      <div className="md:col-span-2 space-y-6">
        {reviews.map((review) => (
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
              <p className="text-sm text-muted-foreground mb-2">
                Reviewed on{" "}
                {new Date(review.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
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
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/product/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch product");
        }

        const data = await response.json();
        
        if (!data) {
          throw new Error("Product not found");
        }

        setProduct(data);
        setActiveImage(
          data.images?.find((img) => img.isDefault)?.url || data.images?.[0]?.url
        );
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // const handleAddToCart = () => {
  //   addToCart({
  //     id: product._id,
  //     name: product.name,
  //     price: product.price,
  //     imageUrl: activeImage,
  //     quantity,
  //   });
  // };

  // const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-5">
          <div className="md:col-span-2 lg:col-span-3 xl:col-span-2 space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-16 rounded-md" />
              ))}
            </div>
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          <div className="md:col-span-3 lg:col-span-4 xl:col-span-3 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-10 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
            <p className="text-muted-foreground">
              We couldn't find the product you're looking for.
            </p>
            <Button className="mt-4" onClick={() => window.location.href = "/"}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const discount = product.percentOff;
  const originalPrice = product.price / (1 - product.percentOff / 100);

  // Dummy reviews
  const dummyReviews = [
    {
      id: 1,
      author: "John Doe",
      rating: 5,
      title: "Great product!",
      date: "2023-05-15",
      comment: "This product exceeded my expectations. Highly recommend!",
    },
    {
      id: 2,
      author: "Jane Smith",
      rating: 4,
      title: "Good value",
      date: "2023-04-22",
      comment: "Works as described. Would buy again.",
    },
  ];

  const renderButtons = () => (
    <>
      <Button
        size="lg"
        className="flex-1 bg-yellow-500 text-black hover:bg-yellow-500/90"
        onClick={handleAddToCart}
        disabled={product.stock <= 0}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
      </Button>
      {/* <Button
        size="lg"
        className="flex-1 bg-orange-500 text-white hover:bg-amber-800"
        disabled={product.stock <= 0}
      >
        Buy Now
      </Button> */}
    </>
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-5">
        {/* Left Column: Image Gallery and Delivery Info */}
        <div className="md:col-span-2 lg:col-span-3 xl:col-span-2">
          <Card>
            <CardContent className="p-4">
              <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-lg">
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-2 pb-2">
                  {product.images?.map((img, index) => (
                    <button
                      key={index}
                      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 ${
                        activeImage === img.url
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                      onClick={() => setActiveImage(img.url)}
                    >
                      <Image
                        src={img.url}
                        alt={img.altText || `${product.name} thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
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
                <Truck className="h-6 w-6 text-primary mt-1" />
                <div>
                  <p className="font-semibold text-foreground">
                    Standard Delivery
                  </p>
                  <p className="text-muted-foreground">
                    Estimated delivery: 3 - 5 days
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Store className="h-6 w-6 text-primary mt-1" />
                <div>
                  <p className="font-semibold text-foreground">Shipped From</p>
                  <p className="text-muted-foreground">Nigeria</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-6 w-6 text-primary mt-1" />
                <div>
                  <p className="font-semibold text-foreground">Return Policy</p>
                  <p className="text-muted-foreground">
                    Free returns within 7 days for official store items and 3 days
                    for other products.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column: Product Details */}
        <div className="md:col-span-3 lg:col-span-4 xl:col-span-3 space-y-4 pb-24 md:pb-0">
          <h1 className="text-2xl font-bold lg:text-3xl">{product.name}</h1>
          {product.brand && (
            <p className="text-sm text-muted-foreground">
              Brand:{" "}
              <span className="text-primary">
                {product.brand}
              </span>
            </p>
          )}

          <div className="flex items-center gap-2">
            <ReviewStars rating={product.rating} />
            <a
              href="#reviews"
              className="text-sm text-muted-foreground hover:underline"
            >
              ({product.numReviews} reviews)
            </a>
          </div>

          <Separator />

          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-primary">
              ₦{formatPrice(product.price)}
            </p>
            {product.percentOff > 0 && (
              <>
                <p className="text-lg text-muted-foreground line-through">
                  ₦{formatPrice(originalPrice)}
                </p>
                <Badge variant="destructive">-{discount}%</Badge>
              </>
            )}
          </div>

          <p
            className={`text-sm font-semibold ${
              product.stock > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {product.stock > 0
              ? `In stock (${product.stock} available)`
              : "Out of stock"}
          </p>

          <Separator />

          <div className="flex items-center gap-4">
            <p className="font-semibold">Quantity:</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center text-lg font-semibold">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= product.stock}
              >
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
              <TabsTrigger value="reviews">
                Reviews ({product.numReviews})
              </TabsTrigger>
            </TabsList>
          </div>
          <Card className="mt-2 rounded-t-none">
            <CardContent className="p-6">
              <TabsContent
                value="description"
                className="mt-0 text-muted-foreground prose prose-sm max-w-none"
              >
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              </TabsContent>
              <TabsContent value="specifications" className="mt-0">
                <ul className="divide-y">
                  {product.specifications?.map((spec, index) => (
                    <li key={index} className="grid grid-cols-2 py-2 text-sm">
                      <span className="font-semibold text-foreground">
                        {spec.key}
                      </span>
                      <span className="text-muted-foreground">
                        {spec.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="reviews" className="mt-0 text-muted-foreground">
                <ReviewList reviews={dummyReviews} />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}