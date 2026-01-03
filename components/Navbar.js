'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Compass, User, LogOut } from 'lucide-react';

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="navbar">
            <div className="container flex-between" style={{ height: '80px' }}>
                <Link href="/" className="logo flex-center" style={{ gap: '10px', fontSize: '1.5rem', fontWeight: '800' }}>
                    <Compass size={36} className="text-gradient" />
                    <span className="text-gradient">GlobeTrotter</span>
                </Link>

                <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                    <Link href="/explore" style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>Explore</Link>
                    <Link href="/community" style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>Community</Link>

                    {session ? (
                        <div className="flex-center" style={{ gap: '1.5rem' }}>
                            <Link href="/dashboard" className="flex-center" style={{ gap: '8px', color: 'var(--text-main)' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={18} color="var(--primary-color)" />
                                </div>
                                <span style={{ fontWeight: '600' }}>{session.user.name}</span>
                            </Link>
                            <button
                                onClick={() => signOut()}
                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex-center" style={{ gap: '1rem' }}>
                            <Link href="/login" style={{ fontWeight: '600', color: 'var(--text-main)' }}>Log In</Link>
                            <Link href="/signup" className="btn btn-primary" style={{ padding: '10px 24px' }}>Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
