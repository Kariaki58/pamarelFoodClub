import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/options";
import { NextResponse } from "next/server";
import Product from "@/models/product";
import Category from "@/models/category";

export async function GET(req, { params }) {
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

        // Get product by ID
        const product = await Product.findById(params.id).populate('category');
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ product }, { status: 200 });

    } catch (error) {
        console.error("Product fetch error:", error);
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}

export async function PUT(req, { params }) {
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

        // Check if product exists
        const existingProduct = await Product.findById(params.id);
        if (!existingProduct) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
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

        // Update the product
        existingProduct.name = productData.name;
        existingProduct.slug = productData.name.toLowerCase().replace(/ /g, '-');
        existingProduct.description = productData.description;
        existingProduct.category = categoryDoc._id;
        existingProduct.section = productData.section;
        existingProduct.specifications = productData.specifications || [];
        
        // Only update images if new ones were provided
        if (productData.images && productData.images.length > 0) {
            existingProduct.images = productData.images.map((img, index) => ({
                url: img,
                publicId: `product-${Date.now()}-${index}`,
                isDefault: index === 0,
                altText: productData.name
            }));
        }
        
        existingProduct.price = productData.price || 0;
        existingProduct.stock = productData.stock || 0;
        existingProduct.percentOff = productData.percentOff || 0;
        existingProduct.tags = productData.tags;
        existingProduct.isTopDeal = productData.isTopDeal;
        existingProduct.isFeatured = productData.isFeatured;
        
        if (productData.flashSale) {
            existingProduct.flashSale = productData.flashSale;
        } else {
            existingProduct.flashSale = undefined;
        }

        await existingProduct.save();

        return NextResponse.json({
            success: true,
            product: existingProduct,
            category: categoryDoc
        }, { status: 200 });

    } catch (error) {
        console.error("Product update error:", error);
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}