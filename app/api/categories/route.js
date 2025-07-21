import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Category from "@/models/category";

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 });

    return NextResponse.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}