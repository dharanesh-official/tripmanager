import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address',
        ],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, // Don't return password by default
    },
    image: {
        type: String,
    },
    preferences: {
        language: { type: String, default: 'en' },
        currency: { type: String, default: 'USD' },
    },
    savedTrips: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true,
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
