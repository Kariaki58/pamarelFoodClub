import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/options";
import { NextResponse } from "next/server";
import Product from "@/models/product";
import Category from "@/models/category";

export async function POST(req) {
    try {
        // Connect to database
        await connectToDatabase();

        // Verify admin session
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findById(session.user.id);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
        }

        // Parse the request body
        const payload = await req.json();
        const { product: productData, category: categoryData } = payload;

        // Validate required fields
        if (!productData || !categoryData) {
            return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 });
        }

        // Check if category exists or create new one
        let categoryDoc = await Category.findOne({ name: categoryData.name });
        if (!categoryDoc) {
            // Create new category
            categoryDoc = new Category({
                name: categoryData.name,
                slug: categoryData.name.toLowerCase().replace(/ /g, '-'),
                description: categoryData.description,
                image: {
                    url: categoryData.image,
                    publicId: `category-${Date.now()}`
                },
            });
            await categoryDoc.save();
        }

        // Process product images
        const productImages = productData.images.map((img, index) => ({
            url: img,
            publicId: `product-${Date.now()}-${index}`,
            isDefault: index === 0,
            altText: productData.name
        }));

        // Process variants
        const processedVariants = productData.variants.map((variant, index) => ({
            combination: new Map(Object.entries(variant.combination)),
            price: variant.price,
            stock: variant.stock,
            sku: variant.sku || `SKU-${Date.now()}-${index}`,
            image: variant.image ? {
                url: variant.image,
                publicId: `variant-${Date.now()}-${index}`
            } : undefined
        }));

        // Create the product with all schema fields
        const productDoc = new Product({
            name: productData.name,
            slug: productData.name.toLowerCase().replace(/ /g, '-'),
            description: productData.description,
            category: categoryDoc._id,
            section: productData.section,
            specifications: productData.specifications || [],
            images: productImages,
            basePrice: productData.basePrice || 0,
            variantTypes: productData.variantTypes || [],
            variants: processedVariants,
            tags: productData.tags || [],
            isTopDeal: productData.isTopDeal || false,
            isFeatured: productData.isFeatured || false,
            flashSale: productData.flashSale ? {
                start: new Date(productData.flashSale.start),
                end: new Date(productData.flashSale.end),
                discountPercent: productData.flashSale.discountPercent
            } : undefined,
            rating: 0,
            numReviews: 0,
            metadata: {
                views: 0,
                purchases: 0
            }
        });

        await productDoc.save();

        // Populate the category in the response
        await productDoc.populate('category');

        return NextResponse.json({
            success: true,
            message: "Product uploaded successfully",
            product: productDoc,
            category: categoryDoc
        }, { status: 201 });

    } catch (error) {
        console.error("Product upload error:", error);
        
        // Handle duplicate key errors (unique slug or SKU)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return NextResponse.json(
                { error: `A product with this ${field} already exists` },
                { status: 400 }
            );
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json(
                { error: "Validation failed", details: errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}

// GET endpoint to fetch products (optional, for testing)
export async function GET(req) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;

        const products = await Product.find()
            .populate('category')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments();

        return NextResponse.json({
            success: true,
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Get products error:", error);
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}