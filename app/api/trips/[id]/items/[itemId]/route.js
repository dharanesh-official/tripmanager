import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import ItineraryItem from '@/models/ItineraryItem';
import Trip from '@/models/Trip';

export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id, itemId } = await params;
        await connectToDatabase();

        // 1. Verify Trip Ownership (Security Best Practice)
        const trip = await Trip.findOne({ _id: id, userId: session.user.id });
        if (!trip) return NextResponse.json({ message: 'Trip not found or unauthorized' }, { status: 403 });

        // 2. Delete the Item
        const deletedItem = await ItineraryItem.findOneAndDelete({ _id: itemId, tripId: id });

        if (!deletedItem) {
            return NextResponse.json({ message: 'Item not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Item deleted safely' }, { status: 200 });
    } catch (error) {
        console.error("Delete Error:", error);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id, itemId } = await params;
        const body = await req.json();
        await connectToDatabase();

        // 1. Verify Trip Permissions (Owner or Planner)
        const trip = await Trip.findById(id);
        if (!trip) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });

        const isOwner = trip.userId.toString() === session.user.id;
        const collaborator = trip.collaborators.find(c => c.userId?.toString() === session.user.id);
        const isPlanner = collaborator?.role === 'planner';

        if (!isOwner && !isPlanner) {
            return NextResponse.json({ message: 'Unauthorized: Read-only access' }, { status: 403 });
        }

        // 2. Update the Item
        const updatedItem = await ItineraryItem.findOneAndUpdate(
            { _id: itemId, tripId: id },
            { $set: body },
            { new: true }
        );

        if (!updatedItem) {
            return NextResponse.json({ message: 'Item not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Item updated', item: updatedItem }, { status: 200 });
    } catch (error) {
        console.error("Update Error:", error);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}
