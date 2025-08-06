import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/user";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request) {
    try {
        await connectToDatabase();

        const { username, email, phone, password, referralCode } = await request.json();

        // Validation
        if (!username || !email || !phone || !password) {
            return NextResponse.json(
                { success: false, error: "All fields are required" },
                { status: 400 }
            );
        }

        console.log({ username, email, phone, password, referralCode })

        // Check existing user
        const existingUser = await User.findOne({
            $or: [{ email }, { username }, { phone }]
        });

        if (existingUser) {
            let errorMessage = "User already exists";
            if (existingUser.email === email) errorMessage = "Email already registered";
            else if (existingUser.username === username) errorMessage = "Username taken";
            else if (existingUser.phone === phone) errorMessage = "Phone number registered";
            
            return NextResponse.json(
                { success: false, error: errorMessage },
                { status: 409 }
            );
        }

        // Handle referral code
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

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // Generate unique referral code
        const userReferralCode = `${username.slice(0, 3)}${Math.floor(1000 + Math.random() * 9000)}`.toUpperCase();

        // Create new user according to schema
        const newUser = new User({
            username,
            email,
            phone,
            password: hashedPassword,
            referralCode: userReferralCode,
            referredBy: referredByUser?._id,
            upline: referredByUser?._id,
            currentPlan: null, // No plan yet
            isVerified: false
        });

        await newUser.save();
        
        if (referredByUser) {
            referredByUser.downlines.push(newUser._id);
            await referredByUser.save();
        }

        return NextResponse.json({
            success: true,
            message: "Registration successful. Please verify your email.",
            data: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        }, { status: 201 });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { success: false, error: "Registration failed. Please try again." },
            { status: 500 }
        );
    }
}