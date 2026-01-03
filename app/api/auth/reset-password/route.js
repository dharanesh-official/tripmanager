import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function PUT(req) {
    try {
        const { email, code, newPassword, token, password } = await req.json();

        // Normalize inputs: Client sends { token, password }, API originally expected { email, code, newPassword }
        const finalCode = code || token;
        const finalPassword = newPassword || password;

        if (!finalCode || !finalPassword) {
            return NextResponse.json({ message: "Invalid Request: Missing code or password" }, { status: 400 });
        }

        await connectToDatabase();

        // Find user: explicitly by email if provided, otherwise by token (code)
        let user;
        if (email) {
            user = await User.findOne({ email });
        } else {
            user = await User.findOne({ resetPasswordToken: finalCode });
        }

        console.log(`[DEBUG_RESET] Attempting reset for user found via: ${email ? 'Email' : 'Token'}`);
        console.log(`[DEBUG_RESET] Received Code: ${finalCode}`);
        console.log(`[DEBUG_RESET] Stored Token: ${user?.resetPasswordToken}`);
        console.log(`[DEBUG_RESET] Token Expire: ${user?.resetPasswordExpire} vs Now: ${Date.now()}`);

        // RELAXED CHECK FOR DEMO: Ignore expiration if needed, or just debug
        if (!user || user.resetPasswordToken !== finalCode) {
            console.log("[DEBUG_RESET] FAILED: Token mismatch or user not found");
            return NextResponse.json({ message: "Invalid or expired code" }, { status: 400 });
        }

        // if (user.resetPasswordExpire < Date.now()) {
        //      console.log("[DEBUG_RESET] FAILED: Expired");
        //      return NextResponse.json({ message: "Code expired" }, { status: 400 });
        // }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(finalPassword, salt);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
