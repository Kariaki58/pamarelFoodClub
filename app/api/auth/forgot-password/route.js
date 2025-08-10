import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/dbConnect'
import crypto from 'crypto'
import User from '@/models/user'

export async function POST(request) {

  try {
    const { email } = await request.json()

    // Validate email exists in request
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    console.log(email);

    await connectToDatabase()


    // Find user by email
    const user = await User.findOne({ email })

    console.log(user)
    if (!user) {
      // Security: don't reveal if email doesn't exist
      return NextResponse.json(
        { 
          success: true, 
          message: 'If an account exists with this email, a reset link has been sent' 
        },
        { status: 200 }
      )
    }

    // Generate token and set expiration (1 hour from now)
    const token = crypto.randomBytes(32).toString('hex')
    const expireToken = Date.now() + 3600000 // 1 hour in milliseconds

    // Save token to user
    user.verifyToken = token
    user.expireToken = new Date(expireToken)
    await user.save()

    // Create reset link
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`

    // In production, you would send an email here
    console.log('Password reset link:', resetLink) // For development only

    return NextResponse.json(
      { 
        success: true, 
        message: 'Password reset link sent to your email' 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while processing your request' 
      },
      { status: 500 }
    )
  }
}