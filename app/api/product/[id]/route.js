import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import product from "@/models/product";
import mongoose from "mongoose";
import category from "@/models/category";

export async function GET(req, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    console.log({id})

    // Check if ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid product ID format" },
        { status: 400 }
      );
    }

    const productData = await product.findById(id).populate("category");

    if (!productData) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...productData.toObject(),
      _id: productData._id.toString(), // Convert ObjectId to string
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}