'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Signup() {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (step === 1) {
                // Request OTP
                const res = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Something went wrong');

                // Move to OTP step
                setStep(2);
            } else {
                // Verify OTP
                const res = await fetch('/api/auth/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: formData.email, otp }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Invalid OTP');

                // Redirect on success
                router.push('/login?registered=true');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', padding: '20px' }}>
            {/* Ambient Background Glow */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '600px', height: '600px', background: 'var(--primary-color)',
                filter: 'blur(250px)', opacity: 0.1, zIndex: 0
            }} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ width: '100%', maxWidth: '450px', position: 'relative', zIndex: 1, backdropFilter: 'blur(20px)', background: 'rgba(24, 24, 27, 0.8)' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Join GlobeTrotter</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Start planning your dream journey today.</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#EF4444',
                            padding: '12px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        <AlertCircle size={18} /> {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                    {step === 1 ? (
                        <>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-main)' }}>Full Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-main)' }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-secondary)' }} />
                                    <input
                                        type="email"
                                        className="input-field"
                                        style={{ paddingLeft: '48px' }}
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-main)' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-secondary)' }} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="input-field"
                                        style={{ paddingLeft: '48px' }}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                            <div style={{ background: 'rgba(37, 99, 235, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <Mail size={32} color="var(--primary-color)" />
                            </div>
                            <h3 style={{ marginBottom: '8px' }}>Verify your Email</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                                We sent a 6-digit code to <strong>{formData.email}</strong>.
                            </p>
                            <input
                                type="text"
                                className="input-field"
                                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', padding: '16px' }}
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                required
                                maxLength={6}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', fontSize: '1.1rem', padding: '14px' }}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (step === 1 ? 'Sign Up' : 'Verify Account')}
                    </button>
                </form>

                <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link href="/login" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Log In</Link>
                </p>
            </motion.div>
        </div>
    );
}
