import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import Trip from '@/models/Trip';
import ItineraryItem from '@/models/ItineraryItem';

// GET: Fetch single trip details + itinerary
export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        await connectToDatabase();

        const trip = await Trip.findOne({ _id: id, userId: session.user.id });
        if (!trip) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });

        const itinerary = await ItineraryItem.find({ tripId: id }).sort({ day: 1, startTime: 1 });

        return NextResponse.json({ trip, itinerary }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}

// POST: Add new itinerary item
export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        const body = await req.json();

        await connectToDatabase();

        // Verify ownership
        const trip = await Trip.findOne({ _id: id, userId: session.user.id });
        if (!trip) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });

        const newItem = await ItineraryItem.create({
            tripId: id,
            ...body
        });

        return NextResponse.json({ message: 'Item added', item: newItem }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}
