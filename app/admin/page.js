'use client';

import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { BarChart3, Users, Map, Activity, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalUsers: 0, totalTrips: 0, activeNow: 0 });
    const [recentUsers, setRecentUsers] = useState([]);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            if (status === 'loading') return;
            if (status === 'unauthenticated' || session?.user?.email?.toLowerCase() !== 'admin@globetrotter.com') {
                // Redirect unauthorized users
                window.location.href = '/dashboard';
                return;
            }

            try {
                const res = await fetch('/api/admin/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.stats);
                    setRecentUsers(data.recentUsers);

                    // Process Chart Data
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const processedChart = [];

                    // Generate last 6 months keys
                    const today = new Date();
                    for (let i = 5; i >= 0; i--) {
                        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                        const mIndex = d.getMonth() + 1; // 1-12
                        const year = d.getFullYear();

                        // Find matching data in API response
                        const tripCount = data.graphData?.trips?.find(item => item._id.month === mIndex && item._id.year === year)?.count || 0;
                        const userCount = data.graphData?.users?.find(item => item._id.month === mIndex && item._id.year === year)?.count || 0;

                        processedChart.push({
                            name: monthNames[d.getMonth()],
                            users: userCount,
                            trips: tripCount
                        });
                    }
                    setChartData(processedChart);
                }
            } catch (error) {
                console.error("Failed to load admin stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [status, session]);

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--background)' }}>
            <Sidebar />
            <main style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
                <div className="container" style={{ maxWidth: '1200px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                            <div>
                                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', color: 'var(--primary-color)' }}>Admin Dashboard</h1>
                                <p style={{ color: 'var(--text-secondary)' }}>Platform Overview & Analytics</p>
                            </div>
                            <div style={{ padding: '8px 16px', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <span style={{ fontWeight: 'bold', color: '#10b981' }}>● Live Data</span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex-center" style={{ height: '400px' }}>
                                <Loader2 className="animate-spin" size={40} color="var(--primary-color)" />
                            </div>
                        ) : (
                            <>
                                {/* Stats Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                                    <div className="card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3b82f6' }}>
                                            <Users size={32} />
                                        </div>
                                        <div>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Users</p>
                                            <h2 style={{ fontSize: '2rem', margin: 0 }}>{stats.totalUsers}</h2>
                                        </div>
                                    </div>
                                    <div className="card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
                                            <Map size={32} />
                                        </div>
                                        <div>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Trips</p>
                                            <h2 style={{ fontSize: '2rem', margin: 0 }}>{stats.totalTrips}</h2>
                                        </div>
                                    </div>
                                    <div className="card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: '#f59e0b' }}>
                                            <Activity size={32} />
                                        </div>
                                        <div>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Active Now</p>
                                            <h2 style={{ fontSize: '2rem', margin: 0 }}>{stats.activeNow}</h2>
                                        </div>
                                    </div>
                                </div>

                                {/* Charts */}
                                <div className="card" style={{ padding: '32px', marginBottom: '32px', height: '400px' }}>
                                    <h3 style={{ marginBottom: '24px' }}>Growth Trends (Last 6 Months)</h3>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                            <XAxis dataKey="name" stroke="var(--text-secondary)" />
                                            <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
                                            <Tooltip
                                                contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }}
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            />
                                            <Bar dataKey="users" fill="#3b82f6" name="New Users" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="trips" fill="#10b981" name="New Trips" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Recent Activity Table */}
                                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
                                        <h3 style={{ margin: 0 }}>Recent Signups</h3>
                                    </div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-secondary)' }}>
                                        <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                            <tr>
                                                <th style={{ textAlign: 'left', padding: '16px' }}>User</th>
                                                <th style={{ textAlign: 'left', padding: '16px' }}>Email</th>
                                                <th style={{ textAlign: 'left', padding: '16px' }}>Joined Date</th>
                                                <th style={{ textAlign: 'left', padding: '16px' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" style={{ padding: '24px', textAlign: 'center' }}>No users found yet.</td>
                                                </tr>
                                            ) : (
                                                recentUsers.map((user) => (
                                                    <tr key={user._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                        <td style={{ padding: '16px', color: 'var(--text-primary)' }}>{user.name}</td>
                                                        <td style={{ padding: '16px' }}>{user.email}</td>
                                                        <td style={{ padding: '16px' }}>
                                                            {new Date(user.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td style={{ padding: '16px' }}>
                                                            <span style={{ padding: '4px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '0.8rem' }}>Active</span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                    </motion.div>
                </div>
            </main>
        </div>
    );
}
