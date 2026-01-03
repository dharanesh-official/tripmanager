import mongoose from 'mongoose';

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    otp: {
        type: String,
        required: true,
    },
    tempUserData: {
        name: String,
        password: String, // Hashed
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // 5 minutes expiration
    },
});

export default mongoose.models.OTP || mongoose.model('OTP', OTPSchema);
