import Review from "@/models/Review";
import Order from "@/models/order";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/options";
import { reviewSubmissionSchema } from "@/utils/validationSchemas";
import connectToDatabase from "@/lib/dbConnect";

export async function POST(request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new Response(JSON.stringify({
        success: false,
        message: "Unauthorized"
      }), { status: 401 });
    }

    // Parse and validate request body
    const requestBody = await request.json();
    const validation = reviewSubmissionSchema.safeParse(requestBody);

    if (!validation.success) {
      return new Response(JSON.stringify({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors
      }), { status: 400 });
    }

    const { orderId, itemId, productId, rating, comment } = validation.data;

    // Verify the user ordered this product
    const order = await Order.findOne({
      _id: orderId,
      user: session.user.id,
      'items._id': itemId,
      'items.product': productId
    });

    if (!order) {
      return new Response(JSON.stringify({
        success: false,
        message: "Order item not found or you don't have permission to review it"
      }), { status: 404 });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      user: session.user.id,
      product: productId,
      order: orderId
    });

    if (existingReview) {
      return new Response(JSON.stringify({
        success: false,
        message: "You've already reviewed this product"
      }), { status: 400 });
    }

    // Create review
    const review = new Review({
      user: session.user.id,
      product: productId,
      order: orderId,
      rating,
      comment: comment || null,
      isVerifiedPurchase: true
    });

    await review.save();

    // Mark item as reviewed
    await Order.updateOne(
      { _id: orderId, 'items._id': itemId },
      { $set: { 'items.$.isReviewed': true, 'items.$.reviewId': review._id } }
    );

    return new Response(JSON.stringify({
      success: true,
      message: "Review submitted successfully",
      reviewId: review._id
    }), { status: 201 });

  } catch (error) {
    console.error("Error submitting review:", error);
    return new Response(JSON.stringify({
      success: false,
      message: "Failed to submit review",
      error: error.message
    }), { status: 500 });
  }
}