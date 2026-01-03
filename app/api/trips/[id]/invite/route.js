import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import Trip from '@/models/Trip';
import User from '@/models/User';

export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const { email, role = 'visitor' } = await req.json();

        if (!email) return NextResponse.json({ message: 'Email is required' }, { status: 400 });

        await connectToDatabase();

        // 1. Find User to Invite
        const userToInvite = await User.findOne({ email });
        if (!userToInvite) return NextResponse.json({ message: 'User not found. They must sign up first.' }, { status: 404 });

        if (userToInvite._id.toString() === session.user.id) {
            return NextResponse.json({ message: 'You are the owner!' }, { status: 400 });
        }

        // 2. Find Trip (Allow Owner to invite)
        const trip = await Trip.findOne({ _id: id, userId: session.user.id });

        if (!trip) return NextResponse.json({ message: 'Trip not found or unauthorized' }, { status: 403 });

        // 3. Migrate Schema: Convert old simple-ID list to Object list if necessary
        // This handles existing trips created before RBAC
        trip.collaborators = trip.collaborators.map(c => {
            // If it's just an ID (or likely the User document if populated, though usually ID in this query)
            if (c.userId) return c; // Already in new format
            return { userId: c, role: 'visitor' }; // Default legacy shares to 'visitor' (safer) or 'planner'
        });

        // 4. Check if already a collaborator
        const isCollaborator = trip.collaborators.some(c => c.userId.toString() === userToInvite._id.toString());
        if (isCollaborator) {
            // Update role if they are already there? Or just error. Let's just error for now.
            return NextResponse.json({ message: 'User is already a collaborator' }, { status: 400 });
        }

        // 5. Add to collaborators with role
        trip.collaborators.push({ userId: userToInvite._id, role });
        await trip.save();

        return NextResponse.json({ message: `Collaborator added as ${role}!`, user: { name: userToInvite.name } }, { status: 200 });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}
