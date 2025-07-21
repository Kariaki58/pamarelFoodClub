import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import category from "@/models/category";
import Product from "@/models/product";

export async function GET() {
  try {
    await connectToDatabase();

    const products = await Product.find({ isTopDeal: true })
      .sort({ createdAt: -1 })
      .limit(12)
      .populate('category', 'name slug')
      .select('name slug price percentOff images rating numReviews flashSale');

    const productsWithDiscount = products.map(product => {
      const discountPrice = product.percentOff > 0 
        ? product.price * (1 - product.percentOff / 100)
        : null;
      
      return {
        ...product.toObject(),
        discountPrice,
        hasFlashSale: !!product.flashSale && 
                     new Date(product.flashSale.start) <= new Date() && 
                     new Date(product.flashSale.end) >= new Date()
      };
    });

    return NextResponse.json({
      success: true,
      products: productsWithDiscount
    });

  } catch (error) {
    console.error("Error fetching top deals:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch top deals" },
      { status: 500 }
    );
  }
}