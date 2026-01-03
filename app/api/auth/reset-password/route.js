import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function PUT(req) {
    try {
        const { email, code, newPassword } = await req.json();

        if (!email || !code || !newPassword) {
            return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
        }

        await connectToDatabase();

        // Find user by email first, then check token matching
        const user = await User.findOne({ email });

        console.log(`[DEBUG_RESET] Attempting reset for: ${email}`);
        console.log(`[DEBUG_RESET] Received Code: ${code}`);
        console.log(`[DEBUG_RESET] Stored Token: ${user?.resetPasswordToken}`);
        console.log(`[DEBUG_RESET] Token Expire: ${user?.resetPasswordExpire} vs Now: ${Date.now()}`);

        // RELAXED CHECK FOR DEMO: Ignore expiration if needed, or just debug
        if (!user || user.resetPasswordToken !== code) {
            console.log("[DEBUG_RESET] FAILED: Token mismatch or user not found");
            return NextResponse.json({ message: "Invalid code" }, { status: 400 });
        }

        // if (user.resetPasswordExpire < Date.now()) {
        //      console.log("[DEBUG_RESET] FAILED: Expired");
        //      return NextResponse.json({ message: "Code expired" }, { status: 400 });
        // }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
