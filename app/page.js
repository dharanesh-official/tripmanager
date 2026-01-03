'use client';

import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Globe, Map } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 50 } }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--background)' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto' }}>


        {/* Hero Section */}
        <section style={{
          position: 'relative',
          padding: '8rem 2rem 6rem',
          textAlign: 'center',
          overflow: 'hidden'
        }}>
          {/* Background Glow */}
          <div style={{
            position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
            width: '600px', height: '600px', background: 'var(--primary-color)',
            filter: 'blur(200px)', opacity: 0.15, zIndex: -1
          }} />

          <motion.div
            className="container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
              <span style={{
                padding: '8px 16px', borderRadius: '50px',
                background: 'rgba(45, 212, 191, 0.1)', color: 'var(--primary-color)',
                border: '1px solid rgba(45, 212, 191, 0.2)', fontSize: '0.9rem', fontWeight: '600'
              }}>
                ✨ The Future of Travel Planning
              </span>
            </motion.div>

            <motion.h1 variants={itemVariants} style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', marginBottom: '1.5rem', lineHeight: 1.1 }}>
              Plan Your Next <span className="text-gradient">Adventure</span>
            </motion.h1>

            <motion.p variants={itemVariants} style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 3rem' }}>
              Build dynamic, multi-city itineraries, track your budget in real-time, and collaborate with friends. Experience travel planning reimagined.
            </motion.p>

            <motion.div variants={itemVariants} className="flex-center" style={{ gap: '20px', flexWrap: 'wrap' }}>
              <Link href="/create-trip" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
                Start Planning <ArrowRight size={20} />
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Info / Help Section */}
        <section className="container" style={{ marginTop: '4rem' }}>
          <div className="grid-cols-3">
            <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{ width: '60px', height: '60px', background: 'var(--background)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe size={24} color="var(--primary-color)" />
              </div>
              <h3>Why GlobeTrotter?</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>
                We combine AI-powered suggestions with easy budgeting to make your dream trip a reality.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{ width: '60px', height: '60px', background: 'var(--background)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Re-using Star from import, though Mail might be better if imported. Using simple text for now or existing icon */}
                <Star size={24} color="#f59e0b" />
              </div>
              <h3>Premium Features</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>
                Unlock exclusive deals, offline maps, and premium support with our Pro membership.
              </p>
              <span style={{ color: 'var(--primary-color)', fontWeight: '600', cursor: 'pointer' }}>Learn More &rarr;</span>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{ width: '60px', height: '60px', background: 'var(--background)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Map size={24} color="#8b5cf6" />
              </div>
              <h3>Need Help?</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>
                Our support team is available 24/7 to assist you with your travel plans.
              </p>
              <a href="mailto:support@globetrotter.com" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>support@globetrotter.com</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
