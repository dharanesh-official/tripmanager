'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Compass, User, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
            background: 'var(--glass)', backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--glass-border)'
        }}>
            <div className="container flex-between" style={{ height: '80px' }}>
                <Link href={session ? "/dashboard" : "/"} className="logo flex-center" style={{ gap: '10px', fontSize: '1.8rem', fontWeight: '800', textDecoration: 'none' }}>
                    <Compass size={40} className="text-gradient" color="var(--primary-color)" />
                    <span style={{ background: 'linear-gradient(to right, var(--primary-color), var(--accent-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        GlobeTrotter
                    </span>
                </Link>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>

                    {session && (
                        <Link href="/my-trips" className="nav-link" style={{ fontWeight: '600', color: 'var(--text-secondary)', textDecoration: 'none', marginRight: '8px' }}>
                            My Trips
                        </Link>
                    )}

                    <LanguageSelector />
                    <ThemeToggle />

                    {session ? (
                        <div className="flex-center" style={{ gap: '1.5rem' }}>
                            <Link href="/dashboard" className="flex-center" style={{ gap: '8px', color: 'var(--text-main)', textDecoration: 'none' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={20} color="var(--primary-color)" />
                                </div>
                                <span style={{ fontWeight: '600' }}>{session.user.name.split(' ')[0]}</span>
                            </Link>
                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex-center" style={{ gap: '1rem' }}>
                            <Link href="/login" style={{ fontWeight: '600', color: 'var(--text-main)', textDecoration: 'none' }}>Log In</Link>
                            <Link href="/signup" className="btn btn-primary" style={{ padding: '10px 24px', textDecoration: 'none' }}>Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
