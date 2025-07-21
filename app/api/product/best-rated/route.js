import connectToDatabase from "@/lib/dbConnect";
import product from "@/models/product";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectToDatabase();

        const bestRatedProducts = await product.aggregate([
            {
                $match: {
                    numReviews: { $gte: 3 }
                }
            },
            {
                $addFields: {
                    averageRating: { $divide: ["$rating", "$numReviews"] }
                }
            },
            {
                $sort: { 
                    averageRating: -1,
                    numReviews: -1
                }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: "$category"
            },
            {
                $project: {
                    name: 1,
                    slug: 1,
                    price: 1,
                    percentOff: 1,
                    rating: 1,
                    numReviews: 1,
                    images: { $slice: ["$images", 1] },
                    category: {
                        name: "$category.name",
                        slug: "$category.slug"
                    },
                    averageRating: 1,
                    isTopDeal: 1,
                    isFeatured: 1
                }
            }
        ]);

        return NextResponse.json({
            success: true,
            products: bestRatedProducts
        });

    } catch (error) {
        console.error("Error fetching best rated products:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch best rated products" },
            { status: 500 }
        );
    }
}