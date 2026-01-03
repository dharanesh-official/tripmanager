import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Trip from '@/models/Trip';
import Notification from '@/models/Notification'; // To cleanup notifications too if needed

export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        const userId = session.user.id;

        // 1. Delete all trips owned by the user
        // This effectively "deletes them from other visitor and planners" because the trip document is gone.
        // Mongoose doesn't automatically cascade relations (like collaborators array in other trips), 
        // but if the Trip document is deleted, it won't be fetched by queries anymore.
        await Trip.deleteMany({ userId: userId });

        // 2. Remove the user from 'collaborators' list in ANY other trip where they are a member
        // This cleans up their presence in trips they didn't own.
        await Trip.updateMany(
            { "collaborators.userId": userId },
            { $pull: { collaborators: { userId: userId } } }
        );

        // 3. Delete the User account
        await User.findByIdAndDelete(userId);

        // 4. Cleanup Notifications (Optional but good)
        await Notification.deleteMany({ userId: userId });

        return NextResponse.json({ message: 'Account deleted successfully' });

    } catch (error) {
        console.error('Error deleting account:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
