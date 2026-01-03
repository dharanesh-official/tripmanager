'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Type, Image as ImageIcon, Navigation, Loader2 } from 'lucide-react';

export default function CreateTrip() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [tripStats, setTripStats] = useState(null);

    const [suggestions, setSuggestions] = useState({ from: [], to: [] });
    const [isSearching, setIsSearching] = useState({ from: false, to: false });
    const [typingTimeout, setTypingTimeout] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        from: '',
        to: '',
        transportMode: 'car', // default
        startDate: '',
        endDate: '',
        description: '',
    });

    // Auto-complete Search Logic using Photon (Komoot) for better speed & fuzzy search
    const fetchSuggestions = async (query, field) => {
        if (!query || query.length < 3) {
            setSuggestions(prev => ({ ...prev, [field]: [] }));
            setIsSearching(prev => ({ ...prev, [field]: false }));
            return;
        }

        try {
            // Using Photon API for better autocomplete (fuzzy search)
            const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10`);
            const data = await res.json();

            // Format Photon results
            const formattedResults = data.features.map(item => {
                const props = item.properties;
                // Construct a readable address (Name, City, Country)
                const addressParts = [
                    props.name,
                    props.city,
                    props.state,
                    props.country
                ].filter(Boolean); // Remove undefined/null

                // Use a Set to remove duplicates in the address string (e.g. "Berlin, Berlin")
                const uniqueParts = [...new Set(addressParts)];

                return {
                    display_name: uniqueParts.join(', '),
                    lat: item.geometry.coordinates[1], // Photon is [lon, lat]
                    lon: item.geometry.coordinates[0],
                    place_id: props.osm_id || Math.random() // Fallback ID
                };
            });

            setSuggestions(prev => ({ ...prev, [field]: formattedResults }));
        } catch (error) {
            console.error("Autocomplete error:", error);
        } finally {
            setIsSearching(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear previous timeout (Debounce)
        if (typingTimeout) clearTimeout(typingTimeout);

        if (value.length >= 3) {
            setIsSearching(prev => ({ ...prev, [field]: true }));
        } else {
            setIsSearching(prev => ({ ...prev, [field]: false }));
        }

        // Set new timeout to search after 300ms (Responsive)
        const newTimeout = setTimeout(() => {
            fetchSuggestions(value, field);
        }, 300);

        setTypingTimeout(newTimeout);
    };

    const handleSelectSuggestion = (field, suggestion) => {
        setFormData(prev => ({ ...prev, [field]: suggestion.display_name }));
        setSuggestions(prev => ({ ...prev, [field]: [] })); // Close dropdown
    };

    const handleCalculate = async () => {
        if (!formData.from || !formData.to) {
            alert("Please enter both 'From' and 'To' locations.");
            return;
        }
        setCalculating(true);

        try {
            // Function to get real coordinates via Nominatim
            const getCoords = async (city) => {
                // adding addressdetails=1 to get formatted address
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&addressdetails=1&limit=1`);
                const data = await res.json();
                if (data && data.length > 0) {
                    return {
                        lat: parseFloat(data[0].lat),
                        lon: parseFloat(data[0].lon),
                        name: data[0].display_name // Capture the full name found
                    };
                }
                return null;
            };

            const loc1 = await getCoords(formData.from);
            const loc2 = await getCoords(formData.to);

            if (!loc1 || !loc2) {
                alert("Could not find one of the locations. Please be more specific (e.g., 'Paris, France').");
                setCalculating(false);
                return;
            }

            // Haversine Formula for Distance for accuracy
            const R = 6371; // Radius of Earth in km
            const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
            const dLon = (loc2.lon - loc1.lon) * (Math.PI / 180);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(loc1.lat * (Math.PI / 180)) * Math.cos(loc2.lat * (Math.PI / 180)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = Math.round(R * c);

            // Speed lookups (km/h)
            const speeds = {
                bike: 40,
                car: 70,
                bus: 50,
                train: 80,
                flight: 800
            };
            const speed = speeds[formData.transportMode || 'car'];

            // Calculate Duration
            const hours = Math.floor(distance / speed);
            const mins = Math.round(((distance / speed) - hours) * 60);
            const durationStr = `${hours}h ${mins}m`;

            setTripStats({
                distance: `${distance} km`,
                duration: durationStr,
                mode: formData.transportMode,
                originName: loc1.name, // Store the found names
                destName: loc2.name
            });

        } catch (e) {
            console.error(e);
            alert("Failed to calculate. Try again.");
        } finally {
            setCalculating(false);
        }
    };

    // Google Maps Mode Mapping
    const getMapMode = (mode) => {
        switch (mode) {
            case 'bike': return 'd'; // Fallback to Driving as Bicycling (b) often fails in areas without path data
            case 'car': return 'd'; // Driving
            case 'bus':
            case 'train': return 'r'; // Transit
            default: return 'd';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/trips', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.title || `Trip to ${formData.to}`,
                    description: `${formData.description}\n\nRoute: ${formData.from} to ${formData.to} via ${formData.transportMode}. Distance: ${tripStats?.distance || 'Unknown'}`,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    coverImage: `https://source.unsplash.com/1600x900/?${encodeURIComponent(formData.to)},travel` // Auto-fetch image
                }),
            });

            if (!res.ok) throw new Error('Failed to create trip');

            const data = await res.json();
            router.push(`/trips/${data.trip._id}`);
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--background)' }}>
            <Sidebar />
            <main style={{ flex: 1, overflowY: 'auto' }}>


                <div className="container" style={{ maxWidth: '800px', marginTop: '4rem', paddingBottom: '4rem' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card"
                        style={{ padding: '40px' }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--primary-color)' }}>Plan a New Trip</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Get real-time insights for your next journey.</p>
                        </div>

                        <form onSubmit={handleSubmit}>

                            {/* Locations */}
                            <div className="grid-cols-3" style={{ gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                <div style={{ position: 'relative' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>From (Origin)</label>
                                    <div style={{ position: 'relative' }}>
                                        <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
                                        <input
                                            className="input-field"
                                            style={{ paddingLeft: '40px' }}
                                            placeholder="Starting City"
                                            value={formData.from}
                                            onChange={(e) => handleInputChange('from', e.target.value)}
                                            autoComplete="off"
                                        />
                                        {isSearching.from && (
                                            <Loader2 size={18} className="animate-spin" style={{ position: 'absolute', right: '12px', top: '14px', color: 'var(--primary-color)' }} />
                                        )}
                                        {/* Suggestions Dropdown */}
                                        {suggestions.from.length > 0 && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                right: 0,
                                                background: 'var(--card-bg)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '8px',
                                                marginTop: '4px',
                                                zIndex: 10,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                                maxHeight: '200px',
                                                overflowY: 'auto'
                                            }}>
                                                {suggestions.from.map((item) => (
                                                    <div
                                                        key={item.place_id}
                                                        onClick={() => handleSelectSuggestion('from', item)}
                                                        style={{
                                                            padding: '10px 12px',
                                                            cursor: 'pointer',
                                                            borderBottom: '1px solid var(--border)',
                                                            fontSize: '0.9rem',
                                                            color: 'var(--text-primary)',
                                                            transition: 'background 0.2s',
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                                    >
                                                        {item.display_name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>To (Destination)</label>
                                    <div style={{ position: 'relative' }}>
                                        <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
                                        <input
                                            className="input-field"
                                            style={{ paddingLeft: '40px' }}
                                            placeholder="Dream Location"
                                            value={formData.to}
                                            onChange={(e) => handleInputChange('to', e.target.value)}
                                            required
                                            autoComplete="off"
                                        />
                                        {isSearching.to && (
                                            <Loader2 size={18} className="animate-spin" style={{ position: 'absolute', right: '12px', top: '14px', color: 'var(--primary-color)' }} />
                                        )}
                                        {/* Suggestions Dropdown */}
                                        {suggestions.to.length > 0 && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                right: 0,
                                                background: 'var(--card-bg)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '8px',
                                                marginTop: '4px',
                                                zIndex: 10,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                                maxHeight: '200px',
                                                overflowY: 'auto'
                                            }}>
                                                {suggestions.to.map((item) => (
                                                    <div
                                                        key={item.place_id}
                                                        onClick={() => handleSelectSuggestion('to', item)}
                                                        style={{
                                                            padding: '10px 12px',
                                                            cursor: 'pointer',
                                                            borderBottom: '1px solid var(--border)',
                                                            fontSize: '0.9rem',
                                                            color: 'var(--text-primary)',
                                                            transition: 'background 0.2s',
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                                    >
                                                        {item.display_name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>


                            {/* Transport Mode Selection */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Preferred Transport Mode</label>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {['car', 'bike', 'bus', 'train', 'flight'].map(mode => (
                                        <button
                                            key={mode}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, transportMode: mode })}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '20px',
                                                border: `1px solid ${formData.transportMode === mode ? 'var(--primary-color)' : 'var(--border)'}`,
                                                background: formData.transportMode === mode ? 'var(--primary-color)' : 'transparent',
                                                color: formData.transportMode === mode ? 'black' : 'var(--text-secondary)',
                                                textTransform: 'capitalize',
                                                cursor: 'pointer',
                                                fontWeight: '500'
                                            }}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Analysis Button */}
                            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                                <button
                                    type="button"
                                    onClick={handleCalculate}
                                    className="btn btn-secondary"
                                    disabled={calculating}
                                    style={{ width: '100%', borderStyle: 'dashed', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
                                >
                                    {calculating ? 'Analyzing Route...' : '📍 Calculate Distance & Time'}
                                </button>
                            </div>

                            {/* Real-time Stats */}
                            {tripStats && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    style={{ background: 'rgba(45, 212, 191, 0.1)', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--primary-color)' }}
                                >
                                    <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Navigation size={18} /> Route Insights
                                    </h4>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px' }}>
                                        <strong>Route:</strong> {tripStats.originName} <br />
                                        <span style={{ opacity: 0.7 }}>to</span> <br />
                                        {tripStats.destName}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-around', gap: '16px', textAlign: 'center', marginBottom: '16px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Distance</div>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>{tripStats.distance}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Est. Duration</div>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary-color)' }}>{tripStats.duration}</div>
                                        </div>
                                    </div>

                                    {/* Visual Map Route */}
                                    <div style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            allowFullScreen
                                            referrerPolicy="no-referrer-when-downgrade"
                                            src={`https://www.google.com/maps?f=d&dirflg=${getMapMode(formData.transportMode)}&saddr=${encodeURIComponent(formData.from)}&daddr=${encodeURIComponent(formData.to)}&output=embed`}
                                        >
                                        </iframe>
                                    </div>
                                </motion.div>
                            )}


                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Trip Name</label>
                                <div style={{ position: 'relative' }}>
                                    <Type size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
                                    <input
                                        className="input-field"
                                        style={{ paddingLeft: '40px' }}
                                        placeholder="e.g. Summer Vacation"
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
                                    rows={3}
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
        </div>
    );
}
