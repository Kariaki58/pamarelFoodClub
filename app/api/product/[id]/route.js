import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import product from "@/models/product";
import mongoose from "mongoose";
import Review from "@/models/Review";
import category from "@/models/category";


export async function GET(req, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

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


    // Fetch reviews for this product
    const reviews = await Review.find({ product: id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    


    return NextResponse.json({
      ...productData.toObject(),
      _id: productData._id.toString(),
      reviews: reviews.map(review => ({
        id: review._id.toString(),
        author: review.user.name,
        email: review.user.email,
        rating: review.rating,
        comment: review.comment,
        date: review.createdAt,
        isVerifiedPurchase: review.isVerifiedPurchase
      }))
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID format" },
        { status: 400 }
      );
    }

    const deletedProduct = await product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Optionally also delete related reviews
    await Review.deleteMany({ product: id });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}