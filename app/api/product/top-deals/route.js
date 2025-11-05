import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Product from "@/models/product";

export async function GET() {
  try {
    await connectToDatabase();

    const products = await Product.find({ isTopDeal: true })
      .sort({ createdAt: -1 })
      .limit(12)
      .populate('category', 'name slug');

    const productsWithFormattedData = products.map(product => {
      // Calculate original price if there's a percentage off
      const originalPrice = product.percentOff > 0 
        ? product.basePrice / (1 - product.percentOff / 100)
        : null;

      console.log({ originalPrice })
      
      return {
        _id: product._id,
        name: product.name,
        price: product.basePrice,
        originalPrice: originalPrice ? Math.round(originalPrice) : null,
        images: product.images || [],
        rating: product.rating || 0,
        reviewCount: product.numReviews || 0,
        category: product.category,
        slug: product.slug,
        hasFlashSale: !!product.flashSale && 
                     new Date(product.flashSale.start) <= new Date() && 
                     new Date(product.flashSale.end) >= new Date()
      };
    });

    return NextResponse.json({
      success: true,
      products: productsWithFormattedData
    });

  } catch (error) {
    console.error("Error fetching top deals:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch top deals" },
      { status: 500 }
    );
  }
}