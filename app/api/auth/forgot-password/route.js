import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/dbConnect'
import crypto from 'crypto'
import User from '@/models/user'
import nodemailer from 'nodemailer'


export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Find user
    const user = await User.findOne({ email })

    if (!user) {
      // Security: generic message
      return NextResponse.json(
        { success: true, message: 'If an account exists with this email, a reset link has been sent' },
        { status: 200 }
      )
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex')
    const expireToken = Date.now() + 3600000 // 1 hour

    // Save token
    user.verifyToken = token
    user.expireToken = new Date(expireToken)
    await user.save()

    // Reset link
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // or SMTP config
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // Mail options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.name || ''},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
        <br/>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json(
      { success: true, message: 'Password reset link sent to your email' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}
