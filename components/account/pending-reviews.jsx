
"use client";

import { useState } from 'react';
import { orders } from "@/lib/mock-data";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '../ui/textarea';
import Link from 'next/link';
import { cn } from '@/lib/utils';

function ReviewForm({ productName }) {
    const [rating, setRating] = useState(0);

    return (
        <div className="space-y-4">
             <div>
                <h3 className="text-lg font-semibold">{productName}</h3>
                <p className="text-sm text-muted-foreground">How would you rate this product?</p>
            </div>
            <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            "h-8 w-8 cursor-pointer transition-colors",
                            i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                        )}
                        onClick={() => setRating(i + 1)}
                    />
                ))}
            </div>
            <Textarea placeholder="Share your experience with this product..." />
            <Button className="w-full">Submit Review</Button>
        </div>
    );
}


export function PendingReviews({ showAll = false }) {
    const allProductsToReview = orders
        .filter(o => o.status === 'Delivered')
        .flatMap(o => o.items)
        .filter(item => !item.reviewId);

    const productsToReview = showAll ? allProductsToReview : allProductsToReview.slice(0, 3);

    if (productsToReview.length === 0 && !showAll) {
        return null;
    }

    return (
        <div>
            {!showAll && (
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Pending Reviews</h2>
                    <Button asChild variant="link" className="pr-0">
                        <Link href="/account/reviews">View all</Link>
                    </Button>
                </div>
            )}
            {productsToReview.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {productsToReview.map(item => (
                        <Dialog key={item.id}>
                            <Card>
                                <CardContent className="flex items-center gap-4 p-4">
                                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" data-ai-hint="product image"/>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="mt-2 w-full">
                                                <Star className="mr-2 h-4 w-4" />
                                                Write a Review
                                            </Button>
                                        </DialogTrigger>
                                    </div>
                                </CardContent>
                            </Card>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Write a review</DialogTitle>
                                </DialogHeader>
                                <ReviewForm productName={item.name} />
                            </DialogContent>
                        </Dialog>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">You have no pending reviews.</p>
                </div>
            )}
        </div>
    );
}
