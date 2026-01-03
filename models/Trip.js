import mongoose from 'mongoose';

const TripSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Please provide a trip title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    startDate: {
        type: Date,
        required: [true, 'Please provide a start date'],
    },
    endDate: {
        type: Date,
        required: [true, 'Please provide an end date'],
    },
    coverImage: {
        type: String,
        default: '',
    },
    visibility: {
        type: String,
        enum: ['private', 'public', 'shared'],
        default: 'private',
    },
    collaborators: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['planner', 'visitor'],
            default: 'visitor'
        }
    }],
    budget: {
        type: Number,
        default: 0,
    },
    destinations: [{
        city: String,
        country: String,
        arrivalDate: Date,
        departureDate: Date,
    }],
}, {
    timestamps: true,
});

// Prevent Mongoose Recompilation Error in Next.js
// But allow schema updates in dev mode
if (mongoose.models.Trip) {
    delete mongoose.models.Trip;
}

export default mongoose.model('Trip', TripSchema);
