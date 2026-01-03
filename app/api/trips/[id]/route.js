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
        const { id } = await params;
        await connectToDatabase();

        // Find trip by ID
        const trip = await Trip.findById(id).populate('collaborators.userId', 'name email');

        if (!trip) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });

        // Check Access: Owner, Collaborator, or Public
        const isPublic = trip.visibility === 'public';
        const isOwner = session && trip.userId.toString() === session.user.id;
        const isCollab = session && trip.collaborators.some(c => c.userId._id.toString() === session.user.id);

        if (!isPublic && !isOwner && !isCollab) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const itinerary = await ItineraryItem.find({ tripId: id }).sort({ day: 1, startTime: 1 });

        return NextResponse.json({ trip, itinerary }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}

// PUT: Update trip details (e.g., visibility)
export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const body = await req.json();
        await connectToDatabase();

        // Only owner can update trip settings
        const trip = await Trip.findOne({ _id: id, userId: session.user.id });
        if (!trip) return NextResponse.json({ message: 'Trip not found or unauthorized' }, { status: 404 });

        // Update allowed fields
        if (body.visibility) trip.visibility = body.visibility;
        // Add more fields here as needed (dates, title, etc)

        await trip.save();

        return NextResponse.json({ message: 'Trip updated', trip }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}

// POST: Add new itinerary item
export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const body = await req.json();

        await connectToDatabase();

        // Verify ownership OR Planner permission
        const trip = await Trip.findById(id);

        if (!trip) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });

        const isOwner = trip.userId.toString() === session.user.id;
        const collaborator = trip.collaborators.find(c => c.userId?.toString() === session.user.id);
        const isPlanner = collaborator?.role === 'planner';

        if (!isOwner && !isPlanner) {
            return NextResponse.json({ message: 'Unauthorized: Read-only access' }, { status: 403 });
        }

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

// DELETE: Delete entire trip
export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        await connectToDatabase();

        const trip = await Trip.findOneAndDelete({ _id: id, userId: session.user.id });
        if (!trip) return NextResponse.json({ message: 'Trip not found or unauthorized' }, { status: 404 });

        // Cleanup related items
        await ItineraryItem.deleteMany({ tripId: id });

        return NextResponse.json({ message: 'Trip deleted' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}
