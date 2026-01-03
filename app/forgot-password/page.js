'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, KeyRound, Lock, CheckCircle, RefreshCcw } from 'lucide-react';

export default function ForgotPassword() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleSendCode = async (e) => {
        e?.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage('Code sent! Check terminal/console.'); // For demo purpose
                setStep(2);
                setTimer(120); // 2 minutes
            } else {
                setStatus('error');
                setMessage(data.message || 'Something went wrong');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Failed to send request');
        } finally {
            if (status !== 'error') setStatus('idle'); // Reset unless error
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage("Passwords don't match");
            return;
        }

        setStatus('loading');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: otp, newPassword: password }),
            });

            if (res.ok) {
                setStatus('complete');
                setTimeout(() => router.push('/login'), 3000);
            } else {
                const data = await res.json();
                setStatus('error');
                setMessage(data.message || 'Invalid code');
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ width: '100%', maxWidth: '420px', padding: '32px' }}
            >
                <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '24px', textDecoration: 'none', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} /> Back to Login
                </Link>

                {status === 'complete' ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
                        <h2>Password Reset!</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Redirecting to login...</p>
                    </div>
                ) : (
                    <>
                        <h1 style={{ fontSize: '1.8rem', marginBottom: '8px', textAlign: 'center' }}>
                            {step === 1 ? 'Forgot Password?' : 'Enter Verification Code'}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '32px' }}>
                            {step === 1 ? 'Enter email to receive a 6-digit code.' : `Code successfully sent to ${email}`}
                        </p>

                        {step === 1 ? (
                            <form onSubmit={handleSendCode}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Email Address</label>
                                    <div className="input-group">
                                        <Mail size={20} color="var(--text-secondary)" />
                                        <input
                                            type="email"
                                            className="input-field"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? <Loader2 className="animate-spin" /> : 'Send Code'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>6-Digit Code</label>
                                    <div className="input-group">
                                        <KeyRound size={20} color="var(--text-secondary)" />
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="123456"
                                            value={otp}
                                            maxLength={6}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                            style={{ letterSpacing: '2px', fontSize: '1.2rem' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>New Password</label>
                                    <div className="input-group">
                                        <Lock size={20} color="var(--text-secondary)" />
                                        <input
                                            type="password"
                                            className="input-field"
                                            placeholder="Min 6 characters"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
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
                                            placeholder="Retype password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', padding: '12px', marginBottom: '16px' }}
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? <Loader2 className="animate-spin" /> : 'Reset Password'}
                                </button>

                                <div style={{ textAlign: 'center' }}>
                                    <button
                                        type="button"
                                        onClick={handleSendCode}
                                        disabled={timer > 0 || status === 'loading'}
                                        style={{
                                            background: 'none', border: 'none',
                                            color: timer > 0 ? 'var(--text-secondary)' : 'var(--primary-color)',
                                            cursor: timer > 0 ? 'default' : 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto', fontSize: '0.9rem'
                                        }}
                                    >
                                        <RefreshCcw size={14} className={status === 'loading' ? 'animate-spin' : ''} />
                                        {timer > 0 ? `Resend Code in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : 'Resend Code'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {message && status === 'error' && (
                            <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>
                                {message}
                            </div>
                        )}
                        {message && step === 2 && status !== 'error' && (
                            <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.9rem', textAlign: 'center' }}>
                                {message}
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    );
}
