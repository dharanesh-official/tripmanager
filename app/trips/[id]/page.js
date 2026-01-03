'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useToast } from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, MapPin, Clock, DollarSign, Plus,
    Coffee, Plane, Hotel, Camera, Trash2, Share2,
    BarChart3, Sparkles, Users, Send, User, LogOut, Globe
} from 'lucide-react';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

// --- Components ---

const ActivityIcon = ({ type }) => {
    switch (type) {
        case 'transport': return <Plane size={18} color="#3b82f6" />;
        case 'stay': return <Hotel size={18} color="#8b5cf6" />;
        case 'food': return <Coffee size={18} color="#f59e0b" />;
        case 'visiting': return <MapPin size={18} color="#ec4899" />;
        default: return <Camera size={18} color="#10b981" />;
    }
};

const AddItemModal = ({ isOpen, onClose, onAdd, day }) => {
    const [formData, setFormData] = useState({
        title: '', type: 'activity', startTime: '09:00', cost: '', location: ''
    });
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);

    // Auto-complete Search Logic (Photon)
    const fetchSuggestions = async (query) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            setIsSearching(false);
            return;
        }

        try {
            // Search for attractions, tourism, etc.
            const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&tag=tourism&tag=amenity&tag=leisure`);
            const data = await res.json();

            if (!data || !data.features) {
                setSuggestions([]);
                return;
            }

            const results = data.features.map(item => ({
                name: item.properties.name,
                city: item.properties.city || item.properties.state,
                country: item.properties.country,
                lat: item.geometry.coordinates[1],
                lon: item.geometry.coordinates[0],
                osm_id: item.properties.osm_id
            })).filter(i => i.name); // Ensure name exists

            setSuggestions(results);
        } catch (error) {
            console.error("Autocomplete error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleNameChange = (val) => {
        setFormData(prev => ({ ...prev, title: val }));

        if (typingTimeout) clearTimeout(typingTimeout);
        setIsSearching(true);
        const newTimeout = setTimeout(() => {
            fetchSuggestions(val);
        }, 300);
        setTypingTimeout(newTimeout);
    };

    const selectSuggestion = (item) => {
        setFormData(prev => ({
            ...prev,
            title: item.name,
            location: [item.city, item.country].filter(Boolean).join(', ')
        }));
        setSuggestions([]);
    };

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
                style={{ width: '90%', maxWidth: '400px', padding: '24px', background: 'var(--card-bg)', border: '1px solid var(--border)' }}
            >
                <div className="flex-between" style={{ marginBottom: '16px' }}>
                    <h3 style={{ color: 'var(--text-primary)' }}>Add to Day {day}</h3>
                    {/* Toggle between Search / Manual could go here if needed, but search input allows typing anything anyway. */}
                </div>

                <div style={{ position: 'relative', marginBottom: '12px' }}>
                    <input
                        className="input-field"
                        placeholder="Search Places (e.g. Louvre Museum)"
                        value={formData.title}
                        onChange={e => handleNameChange(e.target.value)}
                        autoComplete="off"
                    />
                    {isSearching && <span style={{ position: 'absolute', right: 10, top: 10, color: 'var(--text-secondary)' }}>...</span>}

                    {suggestions.length > 0 && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0,
                            background: 'var(--card-bg)', border: '1px solid var(--border)',
                            borderRadius: '8px', marginTop: '4px', zIndex: 10,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)', maxHeight: '200px', overflowY: 'auto'
                        }}>
                            {suggestions.map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => selectSuggestion(item)}
                                    style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}
                                    className="hover:bg-slate-800"
                                >
                                    <strong>{item.name}</strong> <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.city}, {item.country}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <select
                        className="input-field"
                        value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}
                    >
                        <option value="activity">Activity</option>
                        <option value="visiting">Visiting</option>
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
                    <button className="btn btn-secondary" onClick={onClose} style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}>Cancel</button>
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

const InviteModal = ({ isOpen, onClose, onInvite }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('visitor');

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
                style={{ width: '90%', maxWidth: '400px', padding: '24px', background: 'var(--card-bg)', border: '1px solid var(--border)' }}
            >
                <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Invite Collaborator</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
                    Select their access level.
                </p>
                <input
                    className="input-field" placeholder="friend@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    style={{ marginBottom: '12px' }}
                />
                <select
                    className="input-field"
                    style={{ marginBottom: '24px' }}
                    value={role} onChange={e => setRole(e.target.value)}
                >
                    <option value="visitor">Visitor (View Only)</option>
                    <option value="planner">Planner (Can Edit)</option>
                </select>

                <div className="flex-between">
                    <button className="btn btn-secondary" onClick={onClose} style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => onInvite(email, role)}>Send Invite</button>
                </div>
            </motion.div>
        </div>
    );
};



const MembersModal = ({ isOpen, onClose, collaborators, ownerEmail, onKick, canKick, currentUserId }) => {
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
                style={{ width: '90%', maxWidth: '450px', padding: '0', background: 'var(--card-bg)', border: '1px solid var(--border)', overflow: 'hidden' }}
            >
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ color: 'var(--text-primary)' }}>Trip Members</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Close</button>
                </div>

                <div style={{ padding: '24px', maxHeight: '400px', overflowY: 'auto' }}>
                    <div className="flex-between" style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'black' }}>
                                O
                            </div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', margin: 0 }}>Owner</h4>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{ownerEmail || 'Trip Owner'}</span>
                            </div>
                        </div>
                        <span style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '12px', background: 'rgba(45, 212, 191, 0.2)', color: 'var(--primary-color)' }}>Owner</span>
                    </div>

                    {collaborators && collaborators.map((member, idx) => {
                        const isMe = member.userId?._id === currentUserId || member.userId === currentUserId;
                        return (
                            <div key={idx} className="flex-between" style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                                        {member.userId?.name?.[0] || member.userId?.email?.[0] || 'U'}
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                        <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                            {member.userId?.name || 'User'}
                                        </h4>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{member.userId?.email || 'No Email'}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                        fontSize: '0.8rem', padding: '4px 8px', borderRadius: '12px',
                                        background: member.role === 'planner' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                                        color: member.role === 'planner' ? '#60a5fa' : 'var(--text-secondary)',
                                        textTransform: 'capitalize'
                                    }}>
                                        {member.role || 'visitor'}
                                    </span>

                                    {/* Show Leave button for Self, or Kick button for Owner (but not for self) */}
                                    {(isMe || canKick) && (
                                        <button
                                            onClick={() => {
                                                const action = isMe ? 'leave' : 'remove';
                                                const msg = isMe ? 'Are you sure you want to leave this trip?' : `Are you sure you want to remove ${member.userId?.name || 'this user'}?`;
                                                if (confirm(msg)) {
                                                    onKick(member.userId._id || member.userId);
                                                }
                                            }}
                                            style={{
                                                background: isMe ? 'rgba(239, 68, 68, 0.1)' : 'none',
                                                border: isMe ? '1px solid #ef4444' : 'none',
                                                borderRadius: '4px',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                padding: isMe ? '4px 8px' : '4px',
                                                fontSize: isMe ? '0.8rem' : 'inherit',
                                                display: 'flex', alignItems: 'center', gap: '4px'
                                            }}
                                            title={isMe ? "Leave Trip" : "Kick Member"}
                                        >
                                            {isMe ? 'Leave' : <Trash2 size={16} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {(!collaborators || collaborators.length === 0) && (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '16px' }}>No other members yet.</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const BudgetEditModal = ({ isOpen, onClose, itinerary, onUpdate }) => {
    if (!isOpen) return null;

    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');

    const handleStartEdit = (item) => {
        setEditingId(item._id);
        setEditValue(item.cost || 0);
    };

    const handleSave = async (id) => {
        await onUpdate(id, editValue);
        setEditingId(null);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="card"
                style={{ width: '90%', maxWidth: '600px', height: '80vh', padding: '0', background: 'var(--card-bg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}
            >
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ color: 'var(--text-primary)' }}>Manage Budget</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Close</button>
                </div>

                <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-secondary)' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                <th style={{ padding: '12px', color: 'var(--primary-color)' }}>Item</th>
                                <th style={{ padding: '12px', color: 'var(--primary-color)' }}>Type</th>
                                <th style={{ padding: '12px', color: 'var(--primary-color)', textAlign: 'right' }}>Cost (₹)</th>
                                <th style={{ padding: '12px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {itinerary.map(item => (
                                <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{item.title}</td>
                                    <td style={{ padding: '12px', textTransform: 'capitalize' }}>{item.type}</td>
                                    <td style={{ padding: '12px', textAlign: 'right' }}>
                                        {editingId === item._id ? (
                                            <input
                                                type="number"
                                                value={editValue}
                                                onChange={e => setEditValue(e.target.value)}
                                                style={{ width: '80px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '4px', borderRadius: '4px' }}
                                                autoFocus
                                            />
                                        ) : (
                                            <span style={{ fontWeight: '600', color: item.cost > 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                                {item.cost || 0}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'right' }}>
                                        {editingId === item._id ? (
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => handleSave(item._id)} style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                                                <button onClick={() => setEditingId(null)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>X</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleStartEdit(item)} style={{ color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {itinerary.length === 0 && <p style={{ textAlign: 'center', marginTop: '20px' }}>No items to edit.</p>}
                </div>
            </motion.div>
        </div>
    );
};


export default function TripDetails() {
    const { data: session } = useSession();
    const params = useParams();
    const id = params?.id;

    const [trip, setTrip] = useState(null);
    const [itinerary, setItinerary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('itinerary');
    const [modalOpen, setModalOpen] = useState(false);
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [membersModalOpen, setMembersModalOpen] = useState(false);
    const [budgetModalOpen, setBudgetModalOpen] = useState(false);

    // Chat State
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/trips/${id}/messages`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Error fetching messages", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await fetch(`/api/trips/${id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage })
            });

            if (res.ok) {
                const msg = await res.json();
                setMessages([...messages, msg]);
                setNewMessage('');
            }
        } catch (error) {
            console.error("Error sending message", error);
        }
    };

    // Poll for messages when chat is active
    useEffect(() => {
        if (activeTab === 'chat') {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [activeTab, id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    const [selectedDay, setSelectedDay] = useState(1);

    const handleUpdateItemCost = async (itemId, newCost) => {
        try {
            const res = await fetch(`/api/trips/${id}/items/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cost: Number(newCost) })
            });
            if (res.ok) {
                fetchData(id);
            } else {
                alert('Failed to update cost');
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [id]);

    const fetchData = async (tripId) => {
        try {
            const res = await fetch(`/api/trips/${tripId}`);
            if (res.status === 401 || res.status === 403) {
                // If unauthorized (e.g. private trip), redirect if not logged in
                if (status === 'unauthenticated') router.push('/login');
                else router.push('/dashboard'); // or error page
                return;
            }
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

    // Toggle Visibility
    const handleToggleVisibility = async () => {
        if (!trip) return;
        const newVis = trip.visibility === 'public' ? 'private' : 'public';
        const confirmMsg = newVis === 'public'
            ? "Are you sure you want to make this trip PUBLIC? Anyone with the link can view it (read-only)."
            : "Are you sure you want to make this trip PRIVATE? Only members can view it.";

        if (!confirm(confirmMsg)) return;

        try {
            const res = await fetch(`/api/trips/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visibility: newVis })
            });

            if (res.ok) {
                setTrip(prev => ({ ...prev, visibility: newVis }));
                alert(`Trip is now ${newVis}`);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to update settings");
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

    const handleDownloadPDF = async () => {
        const element = document.getElementById('itinerary-content');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const dataImg = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProperties = pdf.getImageProperties(dataImg);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

            pdf.addImage(dataImg, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${trip.title}_itinerary.pdf`);
        } catch (e) {
            console.error(e);
            alert('Failed to generate PDF');
        }
    };

    const handleInvite = async (email, role) => {
        if (!id || !email) return;
        try {
            const res = await fetch(`/api/trips/${id}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Success! ${data.message}`); // Simple feedback
                setInviteModalOpen(false);
                fetchData(id); // Refresh data
            } else {
                alert(data.message);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to send invite');
        }
    };

    const handleKickMember = async (userId) => {
        try {
            const res = await fetch(`/api/trips/${id}/members/${userId}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (res.ok) {
                alert('Member removed successfully');
                fetchData(id);
            } else {
                alert(data.error);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to remove member');
        }
    };



    const handleDeleteItem = async (itemId) => {
        if (!confirm('Are you sure you want to remove this activity?')) return;
        try {
            const res = await fetch(`/api/trips/${id}/items/${itemId}`, { method: 'DELETE' });
            if (res.ok) {
                fetchData(id);
            } else {
                alert('Failed to delete item');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddItem = async (formData) => {
        if (!id) return;
        if (!formData.title?.trim()) {
            alert("Please enter a title");
            return;
        }

        try {
            const payload = {
                ...formData,
                day: selectedDay,
                location: { name: formData.location },
                cost: Number(formData.cost) || 0
            };

            const res = await fetch(`/api/trips/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setModalOpen(false);
                fetchData(id); // Refresh list
            } else {
                const data = await res.json();
                alert(data.message || "Failed to add item");
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred while adding the item");
        }
    };

    if (loading) return <div className="flex-center" style={{ minHeight: '100vh' }}>Loading...</div>;
    if (!trip) return <div className="flex-center" style={{ minHeight: '100vh' }}>Trip not found</div>;

    const totalDays = calculateDays();
    const totalCost = itinerary.reduce((acc, item) => acc + (item.cost || 0), 0);

    const isOwner = session?.user?.id === trip.userId;
    const collaborator = trip.collaborators?.find(c => c.userId === session?.user?.id);
    const isPlanner = collaborator?.role === 'planner';
    const canEdit = isOwner || isPlanner;

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--background)' }}>
            <Sidebar />
            <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>



                {/* Hero Header */}
                <div style={{ position: 'relative', height: '220px' }}>
                    <img
                        src={trip.coverImage || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80"}
                        alt="Trip Cover"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }}
                    />
                    <div className="container" style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', width: '100%' }}>
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            style={{ fontSize: '4rem', color: 'white', textShadow: '0 4px 20px rgba(0,0,0,0.6)', marginBottom: '12px', fontWeight: '800' }}
                        >
                            {trip.title}
                        </motion.h1>
                        <div className="flex-between" style={{ color: 'white', alignItems: 'flex-end' }}>
                            <div className="flex-center" style={{ gap: '24px' }}>
                                <span className="flex-center" style={{ gap: '8px', fontSize: '1.2rem', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                    <Calendar size={22} /> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                                </span>
                                <span className="flex-center" style={{ gap: '8px', fontSize: '1.2rem', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                    <MapPin size={22} /> {totalDays} Day Trip
                                </span>
                                {trip.visibility === 'public' && (
                                    <span className="flex-center" style={{ gap: '6px', fontSize: '0.9rem', background: 'rgba(16, 185, 129, 0.8)', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>
                                        <Globe size={14} /> Public
                                    </span>
                                )}
                            </div>
                            <div className="flex-center" style={{ gap: '12px' }}>
                                {isOwner && (
                                    <div
                                        onClick={handleToggleVisibility}
                                        style={{
                                            display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center',
                                            background: 'rgba(0,0,0,0.4)', borderRadius: '30px', padding: '4px',
                                            cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)', position: 'relative',
                                            height: '42px', width: '180px', marginRight: '12px'
                                        }}
                                        title="Click to toggle visibility"
                                    >
                                        <div style={{
                                            textAlign: 'center', fontSize: '0.9rem', fontWeight: '600',
                                            color: 'white', zIndex: 1, pointerEvents: 'none'
                                        }}>
                                            Public
                                        </div>
                                        <div style={{
                                            textAlign: 'center', fontSize: '0.9rem', fontWeight: '600',
                                            color: 'white', zIndex: 1, pointerEvents: 'none'
                                        }}>
                                            Private
                                        </div>
                                        <motion.div
                                            initial={false}
                                            animate={{
                                                x: trip.visibility === 'public' ? '0%' : '100%'
                                            }}
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            style={{
                                                position: 'absolute', left: '4px', top: '4px', bottom: '4px',
                                                width: 'calc(50% - 4px)',
                                                background: trip.visibility === 'public' ? '#10b981' : '#ef4444',
                                                borderRadius: '20px', zIndex: 0
                                            }}
                                        />
                                    </div>
                                )}
                                <button onClick={handleDownloadPDF} className="btn btn-secondary" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', background: 'transparent' }}>
                                    <Share2 size={18} /> Download
                                </button>
                                <button onClick={handleShare} className="btn btn-secondary" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', background: 'transparent' }}>
                                    <Share2 size={18} /> Share
                                </button>
                                {canEdit && (
                                    <button onClick={() => setInviteModalOpen(true)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                                        <Users size={18} /> Invite
                                    </button>
                                )}
                                <div style={{ background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    <DollarSign size={16} color="var(--primary-color)" />
                                    <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>₹{totalCost}</span>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Est. Cost</span>
                                </div>
                                {isOwner && (
                                    <button
                                        onClick={async () => {
                                            if (!confirm('Are you sure you want to permanently delete this trip?')) return;
                                            try {
                                                const res = await fetch(`/api/trips/${id}`, { method: 'DELETE' });
                                                if (res.ok) {
                                                    if (typeof window !== 'undefined') window.location.href = '/dashboard';
                                                } else {
                                                    alert('Failed to delete trip');
                                                }
                                            } catch (e) {
                                                console.error(e);
                                            }
                                        }}
                                        className="btn btn-secondary"
                                        style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.1)', marginLeft: '12px' }}
                                        title="Delete Trip"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container" style={{ marginTop: '32px' }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid var(--border)' }}>
                        {['itinerary', 'budget', 'chat'].map(tab => (
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
                        <div id="itinerary-content" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', background: 'var(--background)', padding: '20px' }}>


                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
                                {/* Duration Card */}
                                <div className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                                    <div style={{ padding: '16px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', marginBottom: '20px' }}>
                                        <Clock size={40} color="#8b5cf6" />
                                    </div>
                                    <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'center' }}>Trip Duration</span>
                                    <h2 style={{ fontSize: '3.5rem', color: '#8b5cf6', margin: '12px 0', fontWeight: '900', textAlign: 'center' }}>{totalDays} <span style={{ fontSize: '1.5rem', fontWeight: '600' }}>Days</span></h2>
                                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Relax & Enjoy</p>
                                </div>

                                {/* Dates Card */}
                                <div className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                                    <div style={{ padding: '16px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', marginBottom: '20px' }}>
                                        <Calendar size={40} color="#f59e0b" />
                                    </div>
                                    <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'center' }}>Trip Dates</span>
                                    <h2 style={{ fontSize: '1.8rem', color: '#f59e0b', margin: '12px 0', fontWeight: '800', textAlign: 'center' }}>
                                        {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </h2>
                                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{new Date(trip.startDate).getFullYear()}</p>
                                </div>

                                {/* Members Card */}
                                <div
                                    className="card"
                                    style={{
                                        padding: '40px',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        cursor: canEdit ? 'pointer' : 'default',
                                        border: canEdit ? '2px solid #3b82f6' : '1px solid var(--border)',
                                        background: canEdit ? 'rgba(59, 130, 246, 0.05)' : 'var(--card-bg)',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        boxShadow: canEdit ? '0 4px 20px rgba(59, 130, 246, 0.1)' : 'none'
                                    }}
                                    onClick={() => {
                                        if (canEdit) setMembersModalOpen(true);
                                    }}
                                >
                                    <div style={{ padding: '16px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', marginBottom: '20px' }}>
                                        <Users size={40} color="#3b82f6" />
                                    </div>
                                    <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'center' }}>Total Trip Members</span>
                                    <h2 style={{ fontSize: '3.5rem', color: '#3b82f6', margin: '12px 0', fontWeight: '900', textAlign: 'center' }}>
                                        {(trip.collaborators?.length || 0) + 1}
                                    </h2>
                                    <p style={{ fontSize: '1.1rem', color: canEdit ? '#3b82f6' : 'var(--text-secondary)', fontWeight: canEdit ? '700' : '400', textAlign: 'center', lineHeight: '1.4' }}>
                                        {canEdit ? `Click to View Members 👥` : 'People travelling'}
                                    </p>
                                </div>

                                {/* Budget Card */}
                                <div
                                    className="card"
                                    style={{
                                        padding: '40px',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        cursor: canEdit ? 'pointer' : 'default',
                                        border: canEdit ? '2px solid var(--primary-color)' : '1px solid var(--border)',
                                        background: canEdit ? 'rgba(45, 212, 191, 0.05)' : 'var(--card-bg)',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        boxShadow: canEdit ? '0 4px 20px rgba(45, 212, 191, 0.1)' : 'none'
                                    }}
                                    onClick={() => canEdit && setBudgetModalOpen(true)}
                                >
                                    <div style={{ padding: '16px', borderRadius: '50%', background: 'rgba(45, 212, 191, 0.1)', marginBottom: '20px' }}>
                                        <DollarSign size={40} color="var(--primary-color)" />
                                    </div>
                                    <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'center' }}>Total Estimated Cost</span>
                                    <h2 style={{ fontSize: '3.5rem', color: 'var(--primary-color)', margin: '12px 0', fontWeight: '900', textAlign: 'center' }}>₹{totalCost}</h2>
                                    <p style={{ fontSize: '1.1rem', color: canEdit ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: canEdit ? '700' : '400', textAlign: 'center', lineHeight: '1.4' }}>
                                        {canEdit ? 'Click to Manage Budget ✏️' : 'Based on planned activities'}
                                    </p>
                                </div>
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
                                            {canEdit && (
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                                    onClick={() => { setSelectedDay(dayNum); setModalOpen(true); }}
                                                >
                                                    <Plus size={14} /> Add Activity
                                                </button>
                                            )}
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
                                                                <div className="flex-center" style={{ gap: '12px' }}>
                                                                    <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
                                                                        {item.cost > 0 ? `₹${item.cost}` : 'Free'}
                                                                    </span>
                                                                    {canEdit && (
                                                                        <button
                                                                            onClick={() => handleDeleteItem(item._id)}
                                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}
                                                                            title="Remove Item"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    )}
                                                                </div>
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>


                            {/* Budget Card */}

                            <div
                                className="card"
                                style={{
                                    padding: '40px',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    cursor: canEdit ? 'pointer' : 'default',
                                    border: canEdit ? '2px solid var(--primary-color)' : '1px solid var(--border)',
                                    background: canEdit ? 'rgba(45, 212, 191, 0.05)' : 'var(--card-bg)',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    boxShadow: canEdit ? '0 4px 20px rgba(45, 212, 191, 0.1)' : 'none'
                                }}
                                onClick={() => canEdit && setBudgetModalOpen(true)}
                            >
                                <div style={{ padding: '16px', borderRadius: '50%', background: 'rgba(45, 212, 191, 0.1)', marginBottom: '20px' }}>
                                    <DollarSign size={40} color="var(--primary-color)" />
                                </div>
                                <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Total Estimated Cost</span>
                                <h2 style={{ fontSize: '3.5rem', color: 'var(--primary-color)', margin: '12px 0', fontWeight: '900' }}>₹{totalCost}</h2>
                                <p style={{ fontSize: '1.1rem', color: canEdit ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: canEdit ? '700' : '400' }}>
                                    {canEdit ? 'Click to Manage Budget ✏️' : 'Based on planned activities'}
                                </p>
                            </div>




                            {/* Expense Breakdown (Moved user existing breakdown here if needed, or keep it below) */}
                            <div className="card" style={{ gridColumn: '1 / -1', padding: '32px' }}>

                                <h3 style={{ marginBottom: '24px' }}>Expense Breakdown</h3>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'center' }}>
                                    {/* Chart Section */}
                                    <div style={{ height: '300px', width: '100%' }}>
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Transport', value: itinerary.filter(i => i.type === 'transport').reduce((a, b) => a + (b.cost || 0), 0), color: '#3b82f6' },
                                                        { name: 'Stay', value: itinerary.filter(i => i.type === 'stay').reduce((a, b) => a + (b.cost || 0), 0), color: '#8b5cf6' },
                                                        { name: 'Food', value: itinerary.filter(i => i.type === 'food').reduce((a, b) => a + (b.cost || 0), 0), color: '#f59e0b' },
                                                        { name: 'Activity', value: itinerary.filter(i => ['activity', 'visiting'].includes(i.type)).reduce((a, b) => a + (b.cost || 0), 0), color: '#10b981' }
                                                    ].filter(d => d.value > 0)}
                                                    cx="50%" cy="50%"
                                                    innerRadius={60} outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {[
                                                        { name: 'Transport', value: itinerary.filter(i => i.type === 'transport').reduce((a, b) => a + (b.cost || 0), 0), color: '#3b82f6' },
                                                        { name: 'Stay', value: itinerary.filter(i => i.type === 'stay').reduce((a, b) => a + (b.cost || 0), 0), color: '#8b5cf6' },
                                                        { name: 'Food', value: itinerary.filter(i => i.type === 'food').reduce((a, b) => a + (b.cost || 0), 0), color: '#f59e0b' },
                                                        { name: 'Activity', value: itinerary.filter(i => ['activity', 'visiting'].includes(i.type)).reduce((a, b) => a + (b.cost || 0), 0), color: '#10b981' }
                                                    ].filter(d => d.value > 0).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip
                                                    contentStyle={{ background: '#1c1c1e', border: '1px solid #333', borderRadius: '8px' }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                                <Legend verticalAlign="bottom" height={36} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* List Section */}
                                    <div style={{ display: 'grid', gap: '24px' }}>
                                        {['transport', 'stay', 'food', 'activity', 'visiting'].map(cat => {
                                            // Group visiting with activity visually if preferred, or keep separate?
                                            // Let's list specifically.
                                            const catTotal = itinerary.filter(i => i.type === cat).reduce((a, b) => a + (b.cost || 0), 0);
                                            const percent = totalCost > 0 ? (catTotal / totalCost) * 100 : 0;
                                            if (catTotal === 0) return null; // Hide empty cats

                                            const color = cat === 'transport' ? '#3b82f6' : cat === 'stay' ? '#8b5cf6' : cat === 'food' ? '#f59e0b' : cat === 'visiting' ? '#ec4899' : '#10b981';

                                            return (
                                                <div key={cat}>
                                                    <div className="flex-between" style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
                                                        <span style={{ textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <ActivityIcon type={cat} /> {cat}
                                                        </span>
                                                        <span style={{ fontWeight: '600' }}>₹{catTotal} ({Math.round(percent)}%)</span>
                                                    </div>
                                                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${percent}%` }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                            style={{ height: '100%', background: color, borderRadius: '4px' }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}



                    {activeTab === 'chat' && (
                        <div className="card" style={{ height: '70vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
                            {/* Chat Header */}
                            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                                <h3 style={{ margin: 0 }}>Trip Chat 💬</h3>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Discuss plans with your trip members</p>
                            </div>

                            {/* Messages Area */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {messages.length === 0 ? (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ padding: '20px', background: 'var(--background)', borderRadius: '50%' }}>
                                            <Users size={32} />
                                        </div>
                                        <p>No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, index) => {
                                        const isMe = msg.userId?._id === session?.user?.id || msg.userId === session?.user?.id;
                                        const senderName = msg.userId?.name || 'Unknown';
                                        const senderImage = msg.userId?.image;

                                        return (
                                            <div key={msg._id || index} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                                                <div style={{ display: 'flex', gap: '8px', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                                                    {!isMe && (
                                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#333', overflow: 'hidden', flexShrink: 0 }}>
                                                            {senderImage ? (
                                                                <img src={senderImage} alt={senderName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px' }}>
                                                                    {senderName[0]?.toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div>
                                                        {!isMe && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '4px', marginBottom: '4px', display: 'block' }}>{senderName}</span>}
                                                        <div style={{
                                                            padding: '12px 16px',
                                                            borderRadius: '16px',
                                                            borderBottomRightRadius: isMe ? '4px' : '16px',
                                                            borderBottomLeftRadius: isMe ? '16px' : '4px',
                                                            background: isMe ? 'var(--primary-color)' : 'var(--background)',
                                                            color: isMe ? 'white' : 'var(--text-primary)',
                                                            border: isMe ? 'none' : '1px solid var(--border)',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                        }}>
                                                            {msg.content}
                                                        </div>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block', textAlign: isMe ? 'right' : 'left', padding: '0 4px' }}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} style={{ padding: '20px', borderTop: '1px solid var(--border)', background: 'var(--card-bg)', display: 'flex', gap: '12px' }}>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    style={{
                                        flex: 1,
                                        padding: '12px 20px',
                                        borderRadius: '24px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--background)',
                                        color: 'var(--text-primary)',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    style={{
                                        width: '48px', height: '48px',
                                        borderRadius: '50%',
                                        background: newMessage.trim() ? 'var(--primary-color)' : 'var(--border)',
                                        border: 'none',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white',
                                        cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                <AddItemModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onAdd={handleAddItem}
                    day={selectedDay}
                />
                <InviteModal
                    isOpen={inviteModalOpen}
                    onClose={() => setInviteModalOpen(false)}
                    onInvite={handleInvite}
                />
                <MembersModal
                    isOpen={membersModalOpen}
                    onClose={() => setMembersModalOpen(false)}
                    collaborators={trip.collaborators}
                    ownerEmail={trip.userId?.email || 'Trip Owner'}
                    onKick={handleKickMember}
                    canKick={trip?.userId?._id === session?.user?.id}
                    currentUserId={session?.user?.id}
                />
                <BudgetEditModal
                    isOpen={budgetModalOpen}
                    onClose={() => setBudgetModalOpen(false)}
                    itinerary={itinerary}
                    onUpdate={handleUpdateItemCost}
                />
            </main>
        </div>
    );
}
