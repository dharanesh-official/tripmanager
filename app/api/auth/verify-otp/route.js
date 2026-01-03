import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import OTP from '@/models/OTP';

import { sendEmail } from '@/lib/email';

export async function POST(req) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }

        await connectToDatabase();

        // Find OTP record
        const otpRecord = await OTP.findOne({ email });

        if (!otpRecord) {
            return NextResponse.json({ message: 'OTP expired or not found. Please signup again.' }, { status: 400 });
        }

        if (otpRecord.otp !== otp) {
            return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
        }

        // Create actual user
        const newUser = await User.create({
            name: otpRecord.tempUserData.name,
            email: otpRecord.tempUserData.email || email,
            password: otpRecord.tempUserData.password,
        });

        // Send Welcome Email
        await sendEmail({
            to: newUser.email,
            subject: 'Welcome to Tripplanner_by_KD!',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h1 style="color: #2563eb;">Welcome to Tripplanner_by_KD, ${newUser.name}! 🌍</h1>
                    <p>We are thrilled to have you on board.</p>
                    <p>Start planning your dream journeys, collaborate with friends, and manage your trips effortlessly.</p>
                    <br/>
                    <p>Happy Travels,<br/>The Tripplanner_by_KD Team</p>
                </div>
            `
        });

        // Delete OTP record
        await OTP.deleteOne({ _id: otpRecord._id });

        return NextResponse.json(
            { message: 'Verification successful', userId: newUser._id },
            { status: 201 }
        );

    } catch (error) {
        console.error('OTP Verification Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
