'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Loader2, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
    const params = useParams();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage("Passwords don't match");
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage("Password must be at least 6 characters");
            return;
        }

        setStatus('loading');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: params.token, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setStatus('error');
                setMessage(data.message || 'Something went wrong');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Failed to reset password');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--background)', padding: '20px'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card"
                style={{ width: '100%', maxWidth: '400px', padding: '32px' }}
            >
                {status === 'success' ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <CheckCircle size={48} color="#10b981" style={{ marginBottom: '16px' }} />
                        <h2 style={{ marginBottom: '8px' }}>Password Reset!</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Redirecting to login...</p>
                    </div>
                ) : (
                    <>
                        <h1 style={{ fontSize: '1.8rem', marginBottom: '8px', textAlign: 'center' }}>Reset Password</h1>
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '32px' }}>
                            Create a new password for your account.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>New Password</label>
                                <div className="input-group">
                                    <Lock size={20} color="var(--text-secondary)" />
                                    <input
                                        type="password"
                                        className="input-field"
                                        placeholder="Min 6 chars"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Confirm Password</label>
                                <div className="input-group">
                                    <Lock size={20} color="var(--text-secondary)" />
                                    <input
                                        type="password"
                                        className="input-field"
                                        placeholder="Confirm password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {status === 'error' && (
                                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '16px', fontSize: '0.9rem' }}>
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? <Loader2 className="animate-spin" /> : 'Update Password'}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
}
