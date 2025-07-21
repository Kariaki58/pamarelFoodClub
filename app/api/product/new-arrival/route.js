import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import product from "@/models/product";
import category from "@/models/category";

export async function GET() {
  try {
    await connectToDatabase();

    // Calculate date 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find all active products created in the last 3 days
    const newArrivals = await product.find({
      createdAt: { $gte: threeDaysAgo },
    })
    .sort({ createdAt: -1 })
    .populate('category', 'name slug')
    .lean();
    

    // Simplify the response structure
    const simplifiedProducts = newArrivals.map(product => ({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      percentOff: product.percentOff,
      images: product.images,
      category: product.category,
      discountPrice: product.percentOff > 0 
        ? Math.round(product.price * (1 - product.percentOff / 100) * 100) / 100
        : null
    }));

    return NextResponse.json({
      success: true,
      data: simplifiedProducts
    });

  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch new arrivals" 
      },
      { status: 500 }
    );
  }
}