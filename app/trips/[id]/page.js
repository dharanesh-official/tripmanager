'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, MapPin, Clock, DollarSign, Plus,
    Coffee, Plane, Hotel, Camera, Trash2, Share2,
    BarChart3, Sparkles
} from 'lucide-react';

// --- Components ---

const ActivityIcon = ({ type }) => {
    switch (type) {
        case 'transport': return <Plane size={18} color="#3b82f6" />;
        case 'stay': return <Hotel size={18} color="#8b5cf6" />;
        case 'food': return <Coffee size={18} color="#f59e0b" />;
        default: return <Camera size={18} color="#10b981" />;
    }
};

const AddItemModal = ({ isOpen, onClose, onAdd, day }) => {
    const [formData, setFormData] = useState({
        title: '', type: 'activity', startTime: '09:00', cost: '', location: ''
    });

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="card"
                style={{ width: '90%', maxWidth: '400px', padding: '24px', background: '#18181b', border: '1px solid #27272a' }}
            >
                <h3 style={{ marginBottom: '16px', color: 'white' }}>Add to Day {day}</h3>

                <input
                    className="input-field" placeholder="Activity Name (e.g. Visit Museum)"
                    style={{ marginBottom: '12px' }}
                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <select
                        className="input-field"
                        value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}
                    >
                        <option value="activity">Activity</option>
                        <option value="food">Food</option>
                        <option value="transport">Transport</option>
                        <option value="stay">Stay</option>
                    </select>
                    <input
                        type="time" className="input-field"
                        value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <input
                        className="input-field" placeholder="Location"
                        value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
                    />
                    <input
                        type="number" className="input-field" placeholder="Cost"
                        value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })}
                    />
                </div>

                <div className="flex-between">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button
                        className="btn btn-primary"
                        onClick={() => onAdd(formData)}
                    >
                        Add Item
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default function TripDetails({ params }) {
    // In Next.js 15+, params is a Promise, so we need to unwrap it using React.use()
    const unwrappedParams = use(params);

    const [trip, setTrip] = useState(null);
    const [itinerary, setItinerary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('itinerary');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState(1);

    useEffect(() => {
        if (unwrappedParams?.id) {
            fetchData(unwrappedParams.id);
        }
    }, [unwrappedParams]);

    const fetchData = async (id) => {
        try {
            const res = await fetch(`/api/trips/${id}`);
            const data = await res.json();
            if (res.ok) {
                setTrip(data.trip);
                setItinerary(data.itinerary);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const calculateDays = () => {
        if (!trip) return 1;
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const handleShare = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            alert('Trip link copied to clipboard!');
        }
    };

    const handleAutoPlan = async () => {
        if (!unwrappedParams?.id) return;
        const items = [
            { title: 'Morning Coffee', type: 'food', startTime: '09:00', cost: 15, location: 'City Center Cafe' },
            { title: 'Historical Museum', type: 'activity', startTime: '10:30', cost: 25, location: 'National Museum' },
            { title: 'Local Transport', type: 'transport', startTime: '12:30', cost: 5, location: 'Metro Station' }
        ];

        for (const item of items) {
            await fetch(`/api/trips/${unwrappedParams.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...item, day: selectedDay || 1, location: { name: item.location } })
            });
        }
        fetchData(unwrappedParams.id);
    };

    const handleAddItem = async (formData) => {
        if (!unwrappedParams?.id) return;

        try {
            const res = await fetch(`/api/trips/${unwrappedParams.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    day: selectedDay,
                    location: { name: formData.location }
                })
            });
            if (res.ok) {
                setModalOpen(false);
                fetchData(unwrappedParams.id); // Refresh list
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="flex-center" style={{ minHeight: '100vh' }}>Loading...</div>;
    if (!trip) return <div className="flex-center" style={{ minHeight: '100vh' }}>Trip not found</div>;

    const totalDays = calculateDays();
    const totalCost = itinerary.reduce((acc, item) => acc + (item.cost || 0), 0);

    return (
        <main style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '80px' }}>
            <Navbar />

            {/* Hero Header */}
            <div style={{ position: 'relative', height: '300px', marginTop: '80px' }}>
                <img
                    src={trip.coverImage || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80"}
                    alt="Trip Cover"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }}
                />
                <div className="container" style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', width: '100%' }}>
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        style={{ fontSize: '3rem', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)', marginBottom: '8px' }}
                    >
                        {trip.title}
                    </motion.h1>
                    <div className="flex-between" style={{ color: 'white' }}>
                        <div className="flex-center" style={{ gap: '16px', opacity: 0.9 }}>
                            <span className="flex-center" style={{ gap: '6px' }}><Calendar size={18} /> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
                            <span className="flex-center" style={{ gap: '6px' }}><MapPin size={18} /> {totalDays} Day Trip</span>
                        </div>
                        <div className="flex-center" style={{ gap: '12px' }}>
                            <button onClick={handleShare} className="btn btn-secondary" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', background: 'transparent' }}>
                                <Share2 size={18} /> Share
                            </button>
                            <div style={{ background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                <DollarSign size={16} color="var(--primary-color)" />
                                <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>${totalCost}</span>
                                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Est. Cost</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: '32px' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid var(--border)' }}>
                    {['itinerary', 'budget', 'map'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '12px 24px',
                                background: 'none',
                                border: 'none',
                                color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-secondary)',
                                borderBottom: activeTab === tab ? '2px solid var(--primary-color)' : '2px solid transparent',
                                fontWeight: '600', cursor: 'pointer', textTransform: 'capitalize'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {activeTab === 'itinerary' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
                        {/* AI Suggestion Banner */}
                        <div className="card" style={{ background: 'linear-gradient(90deg, rgba(45, 212, 191, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)', border: '1px solid rgba(45, 212, 191, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Sparkles size={20} color="black" />
                                </div>
                                <div>
                                    <h4 style={{ color: 'var(--text-main)' }}>AI Travel Assistant</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Need ideas? I can autofill your itinerary with top rated spots.</p>
                                </div>
                            </div>
                            <button onClick={handleAutoPlan} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Auto-Plan Day</button>
                        </div>

                        {/* Days List */}
                        {Array.from({ length: totalDays }).map((_, i) => {
                            const dayNum = i + 1;
                            const dayItems = itinerary.filter(item => item.day === dayNum);

                            return (
                                <motion.div
                                    key={dayNum}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <div className="flex-between" style={{ marginBottom: '16px' }}>
                                        <h3 style={{ color: 'var(--primary-color)' }}>Day {dayNum}</h3>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                            onClick={() => { setSelectedDay(dayNum); setModalOpen(true); }}
                                        >
                                            <Plus size={14} /> Add Activity
                                        </button>
                                    </div>

                                    <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '24px', marginLeft: '10px' }}>
                                        {dayItems.length === 0 ? (
                                            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>No activities planned yet.</p>
                                        ) : (
                                            dayItems.map(item => (
                                                <div key={item._id} className="card" style={{ marginBottom: '16px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                    <div style={{
                                                        width: '48px', height: '48px', borderRadius: '12px',
                                                        background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        border: '1px solid var(--border)'
                                                    }}>
                                                        <ActivityIcon type={item.type} />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div className="flex-between">
                                                            <h4 style={{ fontSize: '1.1rem' }}>{item.title}</h4>
                                                            <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
                                                                {item.cost > 0 ? `$${item.cost}` : 'Free'}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                            <span className="flex-center" style={{ gap: '4px' }}><Clock size={14} /> {item.startTime}</span>
                                                            {item.location?.name && <span className="flex-center" style={{ gap: '4px' }}><MapPin size={14} /> {item.location.name}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'budget' && (
                    <div className="card" style={{ padding: '32px' }}>
                        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                            <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Total Estimated Cost</span>
                            <h2 style={{ fontSize: '3rem', color: 'var(--primary-color)', margin: '8px 0' }}>${totalCost}</h2>
                        </div>

                        <h3 style={{ marginBottom: '24px' }}>Expense Breakdown</h3>
                        <div style={{ display: 'grid', gap: '24px' }}>
                            {['transport', 'stay', 'food', 'activity'].map(cat => {
                                const catTotal = itinerary.filter(i => i.type === cat).reduce((a, b) => a + (b.cost || 0), 0);
                                const percent = totalCost > 0 ? (catTotal / totalCost) * 100 : 0;
                                const color = cat === 'transport' ? '#3b82f6' : cat === 'stay' ? '#8b5cf6' : cat === 'food' ? '#f59e0b' : '#10b981';

                                return (
                                    <div key={cat}>
                                        <div className="flex-between" style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
                                            <span style={{ textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <ActivityIcon type={cat} /> {cat}
                                            </span>
                                            <span style={{ fontWeight: '600' }}>${catTotal} ({Math.round(percent)}%)</span>
                                        </div>
                                        <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percent}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                style={{ height: '100%', background: color, borderRadius: '6px' }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'map' && (
                    <div className="card" style={{ padding: '0', overflow: 'hidden', height: '600px', position: 'relative' }}>
                        {/* Embed Google Maps for the Trip Destination */}
                        <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                            loading="lazy"
                            allowFullScreen
                            src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(trip.title)}`}
                        >
                            {/* Fallback since we don't have a real API Key in this demo mode */}
                        </iframe>

                        {/* Overlay for "Demo Mode" fallback since user likely doesn't have an API key configured in env for the iframe */}
                        <div style={{
                            position: 'absolute', inset: 0, background: '#18181b',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <MapPin size={48} color="var(--primary-color)" style={{ marginBottom: '16px' }} />
                            <h3 style={{ marginBottom: '8px' }}>Interactive Map View</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', textAlign: 'center', maxWidth: '400px' }}>
                                Visualize your {totalDays}-day journey across {trip.title}.
                            </p>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                {itinerary.filter(i => i.location?.name).slice(0, 3).map((item, i) => (
                                    <div key={i} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '50px', fontSize: '0.9rem', border: '1px solid var(--border)' }}>
                                        📍 {item.location.name}
                                    </div>
                                ))}
                            </div>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.title)}`}
                                target="_blank"
                                className="btn btn-primary"
                                style={{ marginTop: '32px' }}
                            >
                                Open in Google Maps
                            </a>
                        </div>
                    </div>
                )}
            </div>

            <AddItemModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onAdd={handleAddItem}
                day={selectedDay}
            />
        </main>
    );
}
