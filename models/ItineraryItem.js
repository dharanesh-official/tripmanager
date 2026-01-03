import mongoose from 'mongoose';

const ItineraryItemSchema = new mongoose.Schema({
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true,
    },
    day: {
        type: Number,
        required: true // Day number (1, 2, 3...) relative to start date
    },
    type: {
        type: String,
        enum: ['activity', 'transport', 'stay', 'food'],
        default: 'activity',
    },
    title: {
        type: String,
        required: true,
    },
    description: String,
    location: {
        name: String,
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    startTime: String, // "14:00"
    endTime: String,
    cost: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    status: {
        type: String,
        enum: ['planned', 'booked', 'done'],
        default: 'planned'
    }
}, {
    timestamps: true,
});

export default mongoose.models.ItineraryItem || mongoose.model('ItineraryItem', ItineraryItemSchema);
