'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Plus, Calendar, MapPin, Clock, Edit2, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchTrips();
        }
    }, [status, router]);

    const fetchTrips = async () => {
        try {
            const res = await fetch('/api/trips');
            const data = await res.json();
            if (res.ok) {
                setTrips(data.trips || []);
            }
        } catch (error) {
            console.error('Failed to fetch trips', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--background)' }}>
                <div style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>Loading your adventures...</div>
            </div>
        );
    }

    return (
        <main style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
            <Navbar />

            <div className="container" style={{ marginTop: '3rem' }}>
                <div className="flex-between" style={{ marginBottom: '2.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome back, {session?.user?.name?.split(' ')[0]} 👋</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>You have {trips.length} upcoming trips planned.</p>
                    </div>
                    <Link href="/create-trip" className="btn btn-primary">
                        <Plus size={20} /> Plan New Trip
                    </Link>
                </div>

                {trips.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card flex-center"
                        style={{
                            minHeight: '400px',
                            background: 'rgba(255,255,255,0.5)',
                            border: '2px dashed var(--border)',
                            flexDirection: 'column'
                        }}
                    >
                        <div style={{
                            width: '80px', height: '80px', background: 'var(--secondary-color)',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '24px'
                        }}>
                            <MapPin size={40} color="var(--accent-color)" />
                        </div>
                        <h3 style={{ marginBottom: '12px' }}>No trips planned yet</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>It's time to start your next adventure!</p>
                        <Link href="/create-trip" className="btn btn-primary">Create Your First Trip</Link>
                    </motion.div>
                ) : (
                    <div className="grid-cols-3">
                        {trips.map((trip, index) => (
                            <motion.div
                                key={trip._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="card"
                                style={{ padding: 0, overflow: 'hidden', position: 'relative' }}
                            >
                                <div style={{ height: '180px', background: 'gray', position: 'relative' }}>
                                    {trip.coverImage && (
                                        <img
                                            src={trip.coverImage}
                                            alt={trip.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    )}
                                    <span style={{
                                        position: 'absolute', top: '16px', right: '16px',
                                        background: 'rgba(0,0,0,0.6)', color: 'white',
                                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', backdropFilter: 'blur(4px)'
                                    }}>
                                        {Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24))} Days
                                    </span>
                                </div>

                                <div style={{ padding: '20px' }}>
                                    <h3 style={{ marginBottom: '8px', fontSize: '1.25rem' }}>{trip.title}</h3>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>
                                        <Calendar size={16} />
                                        <span>
                                            {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>

                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {trip.description || 'No description provided.'}
                                    </p>

                                    <div className="flex-between">
                                        <Link href={`/trips/${trip._id}`} className="btn btn-secondary" style={{ width: '100%', gap: '8px' }}>
                                            View Itinerary <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
