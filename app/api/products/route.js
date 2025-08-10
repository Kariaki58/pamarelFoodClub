import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Product from "@/models/product";
import Category from "@/models/category";
import Review from "@/models/Review";


export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('cat');
    const searchQuery = searchParams.get('q');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const minPrice = parseFloat(searchParams.get('minPrice'));
    const maxPrice = parseFloat(searchParams.get('maxPrice'));
    const minDiscount = parseFloat(searchParams.get('minDiscount'));
    const minRating = parseFloat(searchParams.get('minRating'));
    const sections = searchParams.get('sections')?.split(',') || [];
    const sortOption = searchParams.get('sort') || 'popular';
    const skip = (page - 1) * limit;

    // Build the query
    let query = {};

    // Category filter
    if (categorySlug && isNaN(categorySlug)) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        query.category = category._id;
      }
    }

    // Rating filter (when cat is a number)
    if (minRating) {
      query.rating = { $gte: minRating };
    }

    // Search filter
    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { 'specifications.value': { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // Price filter
    if (!isNaN(minPrice)) {
      query.price = { ...query.price, $gte: minPrice };
    }
    if (!isNaN(maxPrice)) {
      query.price = { ...query.price, $lte: maxPrice };
    }

    // Discount filter
    if (!isNaN(minDiscount)) {
      query.$expr = {
        $gte: [
          { $multiply: [
            { $divide: [
              { $subtract: ["$originalPrice", "$price"] },
              "$originalPrice"
            ] },
            100
          ]},
          minDiscount
        ]
      };
    }

    // Section filter
    if (sections.length > 0) {
      query.section = { $in: sections };
    }

    // Sorting
    let sort = {};
    switch (sortOption) {
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'best-rated':
        sort.rating = -1;
        break;
      case 'price-low-high':
        sort.price = 1;
        break;
      case 'price-high-low':
        sort.price = -1;
        break;
      case 'popular':
      default:
        sort.numReviews = -1;
        break;
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      products,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}