import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import Trip from '@/models/Trip';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        const trips = await Trip.find({ userId: session.user.id })
            .sort({ startDate: 1 }); // Sort by upcoming

        return NextResponse.json({ trips }, { status: 200 });
    } catch (error) {
        console.error('Fetch trips error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { title, startDate, endDate, description } = body;

        if (!title || !startDate || !endDate) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        await connectToDatabase();

        const trip = await Trip.create({
            userId: session.user.id,
            title,
            startDate,
            endDate,
            description,
            coverImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80', // Default placeholder
        });

        return NextResponse.json({ message: 'Trip created', trip }, { status: 201 });
    } catch (error) {
        console.error('Create trip error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
