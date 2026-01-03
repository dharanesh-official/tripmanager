'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Type, Image as ImageIcon } from 'lucide-react';

export default function CreateTrip() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        startDate: '',
        endDate: '',
        description: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/trips', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to create trip');

            const data = await res.json();
            router.push(`/trips/${data.trip._id}`); // Redirect to itinerary builder
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <Navbar />

            <div className="container" style={{ maxWidth: '800px', marginTop: '4rem', paddingBottom: '4rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                    style={{ padding: '40px' }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--primary-color)' }}>Plan a New Trip</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Start your journey by setting the basics.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Trip Name</label>
                            <div style={{ position: 'relative' }}>
                                <Type size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
                                <input
                                    className="input-field"
                                    style={{ paddingLeft: '40px' }}
                                    placeholder="e.g. Summer in Italy"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid-cols-3" style={{ gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Start Date</label>
                                <div style={{ position: 'relative' }}>
                                    <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
                                    <input
                                        type="date"
                                        className="input-field"
                                        style={{ paddingLeft: '40px' }}
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>End Date</label>
                                <div style={{ position: 'relative' }}>
                                    <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
                                    <input
                                        type="date"
                                        className="input-field"
                                        style={{ paddingLeft: '40px' }}
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description (Optional)</label>
                            <textarea
                                className="input-field"
                                rows={4}
                                placeholder="What are you dreaming of for this trip?"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div className="flex-between">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                style={{ minWidth: '150px' }}
                            >
                                {loading ? 'Creating...' : 'Start Planning'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </main>
    );
}
