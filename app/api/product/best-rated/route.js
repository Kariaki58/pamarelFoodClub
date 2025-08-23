import connectToDatabase from "@/lib/dbConnect";
import product from "@/models/product";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectToDatabase();

        const bestRatedProducts = await product.aggregate([
            { $match: { rating: { $gte: 4 } } },  // filter first
            { $sample: { size: 10 } }             // then pick 10 random docs
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