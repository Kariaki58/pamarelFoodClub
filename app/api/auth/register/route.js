import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/user";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';


export async function POST(request) {
    try {
        await connectToDatabase();

        const { username, email, phone, password, referralCode } = await request.json();

        if (!username || !email || !phone || !password) {
            return NextResponse.json(
                { success: false, error: "All fields are required" },
                { status: 400 }
            );
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            let errorMessage = "User already exists";
            if (existingUser.email === email) errorMessage = "User with this email already exists";
            else if (existingUser.phone === phone) errorMessage = "User with this phone already exists";
            else if (existingUser.username === username) errorMessage = "Username is already taken";
            
            return NextResponse.json(
                { success: false, error: errorMessage },
                { status: 409 }
            );
        }

        let referredByUser = null;
        if (referralCode) {
            referredByUser = await User.findOne({ referralCode });
            if (!referredByUser) {
                return NextResponse.json(
                    { success: false, error: "Invalid referral code" },
                    { status: 400 }
                );
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        const newUser = new User({
            username,
            email,
            phone,
            password: hashedPassword,
            referredBy: referredByUser?._id,
            verificationToken,
            verificationExpires,
            wallets: {
                cash: 0,
                gadget: 0,
                food: 0,
                points: referredByUser ? 100 : 0
            }
        });

        // 8. Save user to database
        await newUser.save();

        // 9. Update referrer's downlines if applicable
        if (referredByUser) {
            await User.findByIdAndUpdate(
                referredByUser._id,
                { $push: { directDownlines: newUser._id } },
                { new: true }
            );
        }

        // 10. Send verification email (pseudo-code)
        // await sendVerificationEmail(newUser.email, verificationToken);

        // 11. Return success response (without sensitive data)
        return NextResponse.json({
            success: true,
            message: "Registration successful. Please check your email for verification.",
            data: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        }, { status: 201 });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error. Please try again later." },
            { status: 500 }
        );
    }
}