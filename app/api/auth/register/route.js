import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import User from '@/models/user';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const { username, email, phone, password, referralCode, planType } = await request.json();

    // Check if user already exists
    const existingUser = await User.findOne({ username });

    console.log({ existingUser })

    if (existingUser) {
      if (existingUser.status === "pending") {
        existingUser.plan = planType;

        const hashedPassword = await bcrypt.hash(password, 12);

        existingUser.password = hashedPassword;

        await existingUser.save();
        
        return NextResponse.json({
          success: true,
          userId: existingUser._id,
          message: 'User registered successfully. Awaiting payment.'
        });
      }
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate referral code
    const userReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Check if referredBy user exists if referral code is provided
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    const user = new User({
      username: username.trim(),
      email,
      phone,
      password: hashedPassword,
      referralCode: userReferralCode,
      referredBy,
      plan: planType,
      status: 'pending',
      currentBoard: "Bronze",
      createdAt: new Date(),
      earnings: { foodWallet: 0, gadgetsWallet: 0, cashWallet: 0 },
      boardProgress: {
        Bronze: { directReferrals: [], completed: false },
        Silver: { level1Referrals: [], level2Referrals: [], completed: false },
        Gold: { level3Referrals: [], level4Referrals: [], completed: false },
      },
    });

    await user.save();

    await User.findByIdAndUpdate(referredBy, {
      $push: { "boardProgress.Bronze.directReferrals": user._id },
    });

    return NextResponse.json({
      success: true,
      userId: user._id,
      message: 'User registered successfully. Awaiting payment.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}