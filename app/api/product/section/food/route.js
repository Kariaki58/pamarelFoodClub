import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Product from "@/models/product";
import category from "@/models/category";


export async function GET() {
  try {
    await connectToDatabase();

    const foodProducts = await Product.find({ section: 'food' })
      .sort({ createdAt: -1 })
      .populate('category', 'name slug')
      // .select('name slug price percentOff images rating numReviews flashSale category');

    const productsWithDiscount = foodProducts.map(product => {
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
      products: productsWithDiscount,
      count: productsWithDiscount.length
    });

  } catch (error) {
    console.error("Error fetching food products:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch food products" },
      { status: 500 }
    );
  }
}