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
        if (!categoryDoc && categoryData.isNew) {
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
        } else if (!categoryDoc && !categoryData.isNew) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        // Create the product with all schema fields
        const productDoc = new Product({
            name: productData.name,
            slug: productData.name.toLowerCase().replace(/ /g, '-'),
            description: productData.description,
            category: categoryDoc._id,
            section: productData.section, // Added section field
            specifications: productData.specifications || [],
            images: productData.images.map((img, index) => ({
                url: img,
                publicId: `product-${Date.now()}-${index}`,
                isDefault: index === 0,
                altText: productData.name
            })),
            price: productData.price || 0,
            stock: productData.stock || 0,
            unitsSold: 0,
            percentOff: productData.percentOff || 0,
            tags: productData.tags,
            isTopDeal: productData.isTopDeal,
            isFeatured: productData.isFeatured,
            flashSale: productData.flashSale,
            rating: 0,
            numReviews: 0,
            metadata: {
                views: 0,
                purchases: 0
            }
        });

        await productDoc.save();

        return NextResponse.json({
            success: true,
            product: productDoc,
            category: categoryDoc
        }, { status: 201 });

    } catch (error) {
        console.error("Product upload error:", error);
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}