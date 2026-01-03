'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { Compass, Mail, Phone, Map, Globe } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return <div className="flex-center" style={{ minHeight: '100vh' }}>Loading...</div>;
    }

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--background)' }}>
            <Sidebar />
            <main style={{ flex: 1, overflowY: 'auto' }}>


                <div className="container" style={{ maxWidth: '1000px' }}>
                    {/* Welcome Hero */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ textAlign: 'center', margin: '4rem 0 6rem' }}
                    >
                        <span style={{
                            background: 'rgba(45, 212, 191, 0.1)', color: 'var(--primary-color)',
                            padding: '8px 16px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: '600',
                            border: '1px solid rgba(45, 212, 191, 0.2)'
                        }}>
                            Welcome to your Personal Command Center
                        </span>
                        <h1 style={{ fontSize: '3.5rem', margin: '24px 0', lineHeight: '1.1' }}>
                            Hello, {session?.user?.name} 👋
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 32px' }}>
                            Ready to explore the world? Manage your upcoming adventures or start planning a new journey today.
                        </p>

                        <div className="flex-center" style={{ gap: '20px' }}>
                            <Link href="/my-trips" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
                                Go to My Trips &rarr;
                            </Link>
                            <Link href="/create-trip" className="btn btn-secondary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
                                Plan New Trip
                            </Link>
                        </div>
                    </motion.div>

                    {/* Contact / Help Section */}
                    <div className="grid-cols-3">
                        <div className="card" style={{ textAlign: 'center' }}>
                            <div style={{ width: '60px', height: '60px', background: 'var(--background)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Mail size={24} color="var(--primary-color)" />
                            </div>
                            <h3>Need Help?</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: '8px 0 16px' }}>Contact our support team anytime.</p>
                            <a href="mailto:support@globetrotter.com" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>support@globetrotter.com</a>
                        </div>

                        <div className="card" style={{ textAlign: 'center' }}>
                            <div style={{ width: '60px', height: '60px', background: 'var(--background)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Globe size={24} color="#3b82f6" />
                            </div>
                            <h3>Community</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: '8px 0 16px' }}>Join 10k+ travelers sharing tips.</p>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Coming Soon</span>
                        </div>

                        <div className="card" style={{ textAlign: 'center' }}>
                            <div style={{ width: '60px', height: '60px', background: 'var(--background)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Phone size={24} color="#8b5cf6" />
                            </div>
                            <h3>Call Us</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: '8px 0 16px' }}>Premium support for pro members.</p>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>+1 (800) GLOBE-TR</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
