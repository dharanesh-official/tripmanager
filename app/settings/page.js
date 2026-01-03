'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { User, Mail, Save, Trash2, LogOut, Globe, Lock, CheckCircle, Loader2 } from 'lucide-react';

const ChangePasswordSection = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch('/api/user/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage('Password changed successfully');
                setCurrentPassword('');
                setNewPassword('');
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('error');
                setMessage(data.message || 'Failed to update');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Something went wrong');
        } finally {
            if (status !== 'success') setStatus('idle');
        }
    };

    return (
        <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
            <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Lock size={24} color="#f59e0b" /> Security
            </h2>
            <form onSubmit={handleChangePassword}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Current Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>New Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            placeholder="Min 6 chars"
                            minLength={6}
                        />
                    </div>
                </div>

                {message && (
                    <div style={{
                        padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem',
                        background: status === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: status === 'success' ? '#10b981' : '#ef4444'
                    }}>
                        {message}
                    </div>
                )}

                <div style={{ textAlign: 'right' }}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f59e0b', borderColor: '#f59e0b' }}
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Update Password
                    </button>
                </div>
            </form>
        </div>
    );
};

export default function Settings() {
    const { data: session } = useSession();
    const [formData, setFormData] = useState({
        name: session?.user?.name || '',
        email: session?.user?.email || '',
        image: session?.user?.image || '',
        language: 'en',
    });

    const handleSave = async (e) => {
        e.preventDefault();
        // In a real app, you would make an API call to update the user profile here
        alert('Profile updated successfully!');
    };

    const handleDeleteAccount = () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            // API call to delete
            alert('Account deleted.');
            signOut();
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--background)' }}>
            <Sidebar />
            <main style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
                <div className="container" style={{ maxWidth: '800px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', color: 'var(--primary-color)' }}>User Settings</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Manage your profile and preferences.</p>

                        <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
                            <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <User size={24} color="var(--primary-color)" /> Profile Information
                            </h2>
                            <form onSubmit={handleSave}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Full Name</label>
                                        <input
                                            className="input-field"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email Address</label>
                                        <input
                                            className="input-field"
                                            value={formData.email}
                                            disabled
                                            style={{ opacity: 0.7, cursor: 'not-allowed' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Profile Image URL</label>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', background: '#333' }}>
                                            <img src={formData.image || 'https://via.placeholder.com/50'} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <input
                                            className="input-field"
                                            style={{ flex: 1 }}
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                        <Save size={18} /> Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
                            <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Globe size={24} color="#3b82f6" /> Preferences
                            </h2>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Language</label>
                                <select
                                    className="input-field"
                                    value={formData.language}
                                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                >
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="hi">Hindi</option>
                                </select>
                            </div>
                        </div>

                        <ChangePasswordSection />

                        <div className="card" style={{ padding: '32px', border: '1px solid #ef4444' }}>
                            <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444' }}>
                                <Trash2 size={24} /> Danger Zone
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                            <button
                                onClick={handleDeleteAccount}
                                className="btn"
                                style={{ background: '#ef4444', color: 'white', border: 'none' }}
                            >
                                Delete Account
                            </button>
                        </div>

                    </motion.div>
                </div>
            </main>
        </div>
    );
}
