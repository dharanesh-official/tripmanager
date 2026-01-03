import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import Trip from '@/models/Trip';
import Notification from '@/models/Notification';

export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        const { id: tripId, userId: memberId } = await params;

        const trip = await Trip.findById(tripId).populate('userId');
        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        const isOwner = trip.userId._id.toString() === session.user.id;
        const isSelf = memberId === session.user.id; // Check if the user is removing themselves (Leaving)

        // Permission Check:
        // 1. User can leave (isSelf)
        // 2. Owner can kick anyone (except self, handled later)
        // Note: Planners CANNOT kick others, only Owner can.
        if (!isSelf && !isOwner) {
            return NextResponse.json({ error: 'Permission denied. Only the owner can remove members.' }, { status: 403 });
        }

        // Find the member to be removed
        const memberIndex = trip.collaborators.findIndex(c => c.userId.toString() === memberId);
        if (memberIndex === -1) {
            return NextResponse.json({ error: 'Member not found in trip' }, { status: 404 });
        }

        const memberToRemove = trip.collaborators[memberIndex];

        // Cannot remove Owner (Owner can delete trip, but not "kick" self here typically, or handled by delete trip)
        if (memberToRemove.userId.toString() === trip.userId._id.toString()) {
            return NextResponse.json({ error: 'Cannot remove the owner' }, { status: 400 });
        }

        // Remove member
        trip.collaborators.splice(memberIndex, 1);
        await trip.save();

        // Create Notification ONLY if kicked (not self-exit)
        if (!isSelf) {
            await Notification.create({
                userId: memberId,
                type: 'kick',
                message: `You have been removed from the trip "${trip.title}".`,
                isRead: false
            });
        }

        return NextResponse.json({ message: isSelf ? 'You have left the trip.' : 'Member removed successfully' });

    } catch (error) {
        console.error('Error removing member:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
