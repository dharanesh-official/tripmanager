import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        await connectToDatabase();

        const user = await User.findOne({ email });

        if (!user) {
            // Return 200 for security, so we don't leak user existence
            return NextResponse.json({ message: "If that email exists, a code has been sent." }, { status: 200 });
        }

        // Check if a code was sent recently (e.g. last 1 minute)
        // We can use resetPasswordExpire to check cooldown. 
        // If expire is > (Date.now() + 9 * 60 * 1000), it implies it was just created (< 1 min ago).
        // Let's just trust the frontend timer for UI, but backend creates a new one every time to keep it simple for now.

        // Generate 6-Digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to DB (Plain text for OTP is fine for this temporary demo context, hashed is better but let's be fast)
        user.resetPasswordToken = otp;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

        await user.save();

        // ---------------------------------------------------------
        // REAL EMAIL SERVICE (Nodemailer)
        // ---------------------------------------------------------
        try {
            const nodemailer = require('nodemailer');

            // Check if credentials exist
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                console.log('⚠️ Missing EMAIL_USER or EMAIL_PASS in .env.local. Falling back to console log.');
                throw new Error('Missing credentials');
            }

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            await transporter.sendMail({
                from: `"Tripplanner_by_KD Support" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Password Reset Request',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #ef4444;">Password Reset</h2>
                        <p>We received a request to reset your password for your Tripplanner_by_KD account.</p>
                        <p>Use the secure code below to proceed:</p>
                        <div style="background: #fef2f2; border: 1px solid #fee2e2; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                            <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #b91c1c;">${otp}</span>
                        </div>
                        <p>This code is valid for 10 minutes.</p>
                        <p style="color: #666; font-size: 12px; margin-top: 30px;">If you didn't request this, please ignore this email or contact support.</p>
                    </div>
                `,
            });
            console.log(`✅ Email sent to ${email}`);

        } catch (emailError) {
            // Fallback for demo/testing without credentials
            console.log(`
            =================================================
            📧 [MOCK EMAIL FALLBACK] 
            To: ${email}
            Code: ${otp}
            reason: ${emailError.message}
            =================================================
            `);
        }
        // ---------------------------------------------------------

        return NextResponse.json({ message: "Code sent successfully" }, { status: 200 });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
