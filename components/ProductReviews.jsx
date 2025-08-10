"use client";

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';


export function ProductReviews({ productId }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedReviews, setExpandedReviews] = useState([]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(`/api/reviews/product/${productId}`);
                const data = await response.json();
                
                if (data.success) {
                    setReviews(data.reviews);
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                console.error("Error loading reviews:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [productId]);

    const toggleExpandReview = (id) => {
        if (expandedReviews.includes(id)) {
            setExpandedReviews(expandedReviews.filter(reviewId => reviewId !== id));
        } else {
            setExpandedReviews([...expandedReviews, id]);
        }
    };

    if (loading) {
        return <div className="h-32 flex items-center justify-center">Loading reviews...</div>;
    }

    return (
        <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
            
            {reviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review._id} className="border-b pb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={cn(
                                                "h-5 w-5",
                                                i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                            )}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            
                            <p className={expandedReviews.includes(review._id) ? '' : 'line-clamp-3'}>
                                {review.comment}
                            </p>
                            
                            {review.comment.length > 200 && (
                                <Button
                                    variant="link"
                                    className="p-0 h-auto text-sm"
                                    onClick={() => toggleExpandReview(review._id)}
                                >
                                    {expandedReviews.includes(review._id) ? 'Show less' : 'Read more'}
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}