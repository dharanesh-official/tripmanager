import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Trip from '@/models/Trip';

export async function GET() {
    try {
        await connectToDatabase();

        // 1. Total Counts
        const totalUsers = await User.countDocuments();
        const totalTrips = await Trip.countDocuments();

        // 2. Recent Users (Last 5)
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email createdAt');

        // 3. Growth Data (Trips created in last 7 months)
        // We aggregate by month to match the chart format
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        sixMonthsAgo.setDate(1); // Start of that month

        const tripsByMonth = await Trip.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const usersByMonth = await User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        return NextResponse.json({
            stats: {
                totalUsers,
                totalTrips,
                activeNow: Math.floor(Math.random() * 10) + 1 // Still mock "Active Socket Users" as we don't track this yet
            },
            recentUsers,
            graphData: { trips: tripsByMonth, users: usersByMonth }
        });

    } catch (error) {
        console.error("Admin Stats Error:", error);
        return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
    }
}
