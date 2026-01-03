import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { sendEmail } from '@/lib/email';

export async function POST(req) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: 'User already exists with this email' },
                { status: 422 }
            );
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP and temp data (upsert to handle retries)
        await OTP.findOneAndUpdate(
            { email },
            {
                email,
                otp,
                tempUserData: { name, password: hashedPassword },
                createdAt: Date.now() // Reset expiry
            },
            { upsert: true, new: true }
        );

        // Send Email
        await sendEmail({
            to: email,
            subject: 'Verify your GlobeTrotter Account',
            html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 5 minutes.</p>`
        });

        return NextResponse.json(
            { message: 'OTP sent to email', requireOtp: true },
            { status: 200 }
        );
    } catch (error) {
        console.error('Signup error DETAILED:', error);
        return NextResponse.json(
            { message: error?.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
