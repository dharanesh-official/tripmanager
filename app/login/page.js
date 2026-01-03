'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const registered = searchParams.get('registered');
    const errorParam = searchParams.get('error');

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(errorParam ? 'Authentication failed' : '');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await signIn('credentials', {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (res.error) {
                setError(res.error);
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card"
            style={{ width: '100%', maxWidth: '450px', position: 'relative', zIndex: 1, backdropFilter: 'blur(20px)', background: 'rgba(24, 24, 27, 0.8)' }}
        >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Welcome Back</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Login to continue planning your trips.</p>
            </div>

            {registered && (
                <div style={{
                    background: 'rgba(45, 212, 191, 0.1)', border: '1px solid var(--primary-color)', color: 'var(--primary-color)',
                    padding: '12px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center'
                }}>
                    Account created successfully! Please log in.
                </div>
            )}

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

                <div style={{ marginBottom: '16px' }}>
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
                    <Link href="/forgot-password" style={{ fontSize: '0.9rem', color: 'var(--primary-color)' }}>Forgot password?</Link>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '1.1rem', padding: '14px' }}
                    disabled={loading}
                >
                    {loading ? 'Logging In...' : 'Log In'}
                </button>
            </form>

            <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Don't have an account? <Link href="/signup" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Sign Up</Link>
            </p>
        </motion.div>
    );
}

export default function Login() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', padding: '20px' }}>
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '600px', height: '600px', background: 'var(--primary-color)',
                filter: 'blur(250px)', opacity: 0.1, zIndex: 0
            }} />
            <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
