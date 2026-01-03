'use client';

import Navbar from '@/components/Navbar';
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
    <main style={{ minHeight: '100vh', paddingBottom: '4rem', paddingTop: '80px' }}>
      <Navbar />

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
            <Link href="/explore" className="btn btn-secondary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
              Explore Destinations
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Recommended Destinations */}
      <section className="container" style={{ marginTop: '4rem' }}>
        <div className="flex-between" style={{ marginBottom: '2.5rem', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Trending Destinations</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Curated selections for your next journey.</p>
          </div>
          <Link href="/explore" style={{ color: 'var(--primary-color)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid-cols-3">
          {[
            { city: 'Kyoto', country: 'Japan', img: 'linear-gradient(45deg, #FF6B6B, #556270)', rating: 4.9, tag: 'Culture' },
            { city: 'Santorini', country: 'Greece', img: 'linear-gradient(45deg, #4facfe, #00f2fe)', rating: 4.8, tag: 'Relax' },
            { city: 'Reykjavik', country: 'Iceland', img: 'linear-gradient(45deg, #43e97b, #38f9d7)', rating: 4.9, tag: 'Adventure' }
          ].map((dest, i) => (
            <motion.div
              key={i}
              className="card"
              whileHover={{ y: -10 }}
              style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--border)' }}
            >
              <div style={{ height: '240px', background: dest.img, position: 'relative' }}>
                <span style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                  padding: '6px 12px', borderRadius: '12px', color: 'white',
                  fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <Star size={14} fill="#fb7185" color="#fb7185" /> {dest.rating}
                </span>
                <span style={{
                  position: 'absolute', bottom: '16px', left: '16px',
                  background: 'rgba(255,255,255,0.9)', color: 'black',
                  padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600'
                }}>
                  {dest.tag}
                </span>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.5rem' }}>{dest.city}</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Map size={16} /> {dest.country}
                </p>
                <button className="btn btn-secondary" style={{ width: '100%' }}>View Guide</button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
