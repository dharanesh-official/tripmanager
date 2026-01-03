'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
    LayoutDashboard, Map, Heart, Settings,
    HelpCircle, LogOut, Compass, User, Globe, LogIn, BarChart3, Menu, X
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile on mount and on resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setIsMobileOpen(false); // Close mobile menu on desktop
            }
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Trips', href: '/my-trips', icon: Compass },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    // Only show Admin to specific user
    if (session?.user?.email?.toLowerCase() === 'admin@globetrotter.com') {
        navItems.push({ name: 'Admin', href: '/admin', icon: BarChart3 });
    }

    // Styles for items (Links/Buttons)
    const getItemStyle = (isActive = false) => {
        // On mobile with menu open, always expand. On desktop, use isExpanded state
        const shouldExpand = isMobile ? isMobileOpen : isExpanded;
        
        return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: shouldExpand ? 'flex-start' : 'center',
        gap: shouldExpand ? '12px' : 0,
        padding: shouldExpand ? '12px 14px' : '0',
        margin: shouldExpand ? '0 12px' : '0 auto',
        width: shouldExpand ? 'calc(100% - 24px)' : '40px', // Slightly smaller for cleaner look
        height: shouldExpand ? 'auto' : '40px',
        borderRadius: '12px',
        textDecoration: 'none',
        color: isActive ? 'white' : 'inherit',
        background: isActive ? '#3b82f6' : 'transparent',
        boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none', // Better shadow or none if preferred
        transition: 'all 0.2s',
        fontWeight: '500',
        whiteSpace: 'nowrap',
    };
    };

    return (
        <>
            {/* Mobile Menu Button - Only visible on mobile */}
            {isMobile && (
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    style={{
                        position: 'fixed',
                        top: '20px',
                        left: '20px',
                        zIndex: 1001,
                        background: '#3b82f6',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            )}

            {/* Mobile Overlay - Click to close */}
            {isMobile && isMobileOpen && (
                <div
                    onClick={() => setIsMobileOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 39,
                    }}
                />
            )}

            {/* Sidebar */}
            <aside
                onMouseEnter={() => !isMobile && setIsExpanded(true)}
                onMouseLeave={() => !isMobile && setIsExpanded(false)}
                className="sidebar"
                style={{
                    width: isMobile ? '280px' : (isMobileOpen || isExpanded) ? '280px' : '100px',
                    height: '100vh',
                    background: '#0f172a', // Always dark
                    color: '#94a3b8',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: isMobile ? '80px 0 24px 0' : '24px 0', // Extra top padding on mobile for X button
                    borderRight: '1px solid #1e293b',
                    flexShrink: 0,
                    transition: 'width 0.3s ease, transform 0.3s ease',
                    overflow: 'auto',
                    overflowX: 'hidden',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    zIndex: 40,
                    transform: isMobile && !isMobileOpen ? 'translateX(-100%)' : 'translateX(0)',
                    boxShadow: isMobile && isMobileOpen ? '0 10px 40px rgba(0, 0, 0, 0.3)' : 'none',
                }}
            >
            {/* Logo */}
            <div className="sidebar-logo" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: (isMobile ? isMobileOpen : isExpanded) ? 'flex-start' : 'center',
                gap: '12px',
                marginBottom: isMobile ? '24px' : '48px',
                color: 'white',
                padding: (isMobile ? isMobileOpen : isExpanded) ? '0 24px' : '0',
                width: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden'
            }}>
                <div style={{
                    background: '#3b82f6',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '44px', height: '44px', // Match button size exactly
                    flexShrink: 0,
                    margin: (isMobile ? isMobileOpen : isExpanded) ? '0' : '0 auto' // Center when collapsed
                }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>GT</span>
                </div>
                <span style={{
                    fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '-0.5px',
                    opacity: (isMobile ? isMobileOpen : isExpanded) ? 1 : 0, transition: 'opacity 0.2s', whiteSpace: 'nowrap',
                    width: (isMobile ? isMobileOpen : isExpanded) ? 'auto' : 0, overflow: 'hidden'
                }}>
                    GlobeTrotter
                </span>
            </div>

            {/* Nav Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, width: '100%' }} className="sidebar-nav">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.name === 'Dashboard' && pathname.startsWith('/trips'));
                    const shouldExpand = isMobile ? isMobileOpen : isExpanded;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            style={getItemStyle(isActive)}
                        >
                            <item.icon size={22} style={{ minWidth: '22px', flexShrink: 0 }} />
                            <span className="sidebar-text" style={{ opacity: shouldExpand ? 1 : 0, transition: 'opacity 0.2s', overflow: 'hidden' }}>{item.name}</span>
                        </Link>
                    )
                })}
            </div>

            {/* Bottom Actions */}
            <div className="sidebar-theme-toggle" style={{ borderTop: '1px solid #1e293b', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>

                {/* Profile */}
                {session && (
                    <Link href="/settings"
                        style={getItemStyle(false)}
                        className="hover:bg-slate-800"
                    >
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                            {session.user.image ? (
                                <img src={session.user.image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={16} color="white" />
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', opacity: (isMobile ? isMobileOpen : isExpanded) ? 1 : 0, transition: 'opacity 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', width: (isMobile ? isMobileOpen : isExpanded) ? 'auto' : 0 }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{session.user.name.split(' ')[0]}</span>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>View Profile</span>
                        </div>
                    </Link>
                )}

                {/* Theme Toggle */}
                <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: (isMobile ? isMobileOpen : isExpanded) ? 'flex-start' : 'center',
                    gap: (isMobile ? isMobileOpen : isExpanded) ? '16px' : 0,
                    padding: (isMobile ? isMobileOpen : isExpanded) ? '8px 0' : '0',
                    margin: (isMobile ? isMobileOpen : isExpanded) ? '0 12px' : '0 auto',
                    width: (isMobile ? isMobileOpen : isExpanded) ? 'calc(100% - 24px)' : '44px',
                    height: (isMobile ? isMobileOpen : isExpanded) ? 'auto' : '44px',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'center', minWidth: '40px', flexShrink: 0 }}>
                        <ThemeToggle />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#cbd5e1', opacity: (isMobile ? isMobileOpen : isExpanded) ? 1 : 0, transition: 'opacity 0.2s', whiteSpace: 'nowrap', width: (isMobile ? isMobileOpen : isExpanded) ? 'auto' : 0, overflow: 'hidden' }}>
                        Switch Theme
                    </span>
                </div>

                {/* Language Selector */}
                <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: (isMobile ? isMobileOpen : isExpanded) ? 'flex-start' : 'center',
                    gap: (isMobile ? isMobileOpen : isExpanded) ? '12px' : 0,
                    padding: '8px 0',
                    margin: (isMobile ? isMobileOpen : isExpanded) ? '0 12px' : '0 auto',
                    width: (isMobile ? isMobileOpen : isExpanded) ? 'calc(100% - 24px)' : '44px',
                    height: (isMobile ? isMobileOpen : isExpanded) ? 'auto' : '44px',
                }}>
                    <div style={{ minWidth: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                        <Globe size={20} color="#94a3b8" />
                    </div>
                    <div style={{ opacity: (isMobile ? isMobileOpen : isExpanded) ? 1 : 0, transition: 'opacity 0.2s', width: (isMobile ? isMobileOpen : isExpanded) ? 'auto' : 0, overflow: 'visible' }}>
                        <LanguageSelector />
                    </div>
                </div>

                {/* Logout or Login */}
                {session ? (
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        style={{
                            ...getItemStyle(false),
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid #1e293b',
                            cursor: 'pointer',
                            fontSize: '0.95rem'
                        }}
                    >
                        <LogOut size={20} style={{ minWidth: '22px', flexShrink: 0 }} />
                        <span style={{ opacity: (isMobile ? isMobileOpen : isExpanded) ? 1 : 0, transition: 'opacity 0.2s', width: (isMobile ? isMobileOpen : isExpanded) ? 'auto' : 0, overflow: 'hidden' }}>Logout</span>
                    </button>
                ) : (
                    <Link
                        href="/login"
                        style={{
                            ...getItemStyle(false),
                            background: '#3b82f6',
                            color: 'white'
                        }}
                    >
                        <LogIn size={20} style={{ minWidth: '22px', flexShrink: 0 }} />
                        <span style={{ opacity: (isMobile ? isMobileOpen : isExpanded) ? 1 : 0, transition: 'opacity 0.2s', width: (isMobile ? isMobileOpen : isExpanded) ? 'auto' : 0, overflow: 'hidden' }}>Login</span>
                    </Link>
                )}
            </div>
            </aside>
        </>
    );
}
