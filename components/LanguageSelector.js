'use client';

import { useEffect, useState } from 'react';
import { Languages } from 'lucide-react';
import Script from 'next/script';

export default function LanguageSelector() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const initGoogleTranslate = () => {
            if (window.google && window.google.translate && window.google.translate.TranslateElement) {
                // Check if already initialized to avoid duplicates (though Google usually handles this, React strict mode can be tricky)
                const existing = document.querySelector('.goog-te-combo');
                if (!existing) {
                    try {
                        new window.google.translate.TranslateElement({
                            pageLanguage: 'en',
                            includedLanguages: 'en,hi,ta,te,kn,ml,bn,mr,gu,pa,or',
                            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                            autoDisplay: false
                        }, 'google_translate_element');
                    } catch (e) {
                        console.error("Google Translate Init Error", e);
                    }
                }
                setLoaded(true);
            }
        };

        if (window.google && window.google.translate) {
            initGoogleTranslate();
        } else {
            // Setup the callback for when the script loads
            window.googleTranslateElementInit = initGoogleTranslate;
        }
    }, []);

    return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            {/* Load Google Translate Script */}
            <Script
                src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
                strategy="afterInteractive"
            />

            {/* Custom Icon (Optional overlay logic could go here, but strictly sticking to Google's element for stability) */}
            {!loaded && <Languages size={20} style={{ opacity: 0.5, marginRight: 8 }} />}

            {/* The Google Translate Container */}
            <div id="google_translate_element" style={{
                minWidth: '120px',
                // Hacky CSS to style the google dropdown slightly better if possible, 
                // typically it's hard to style standard iframes/injects without deep CSS.
                // We'll keep it simple to ensure functionality.
            }} />

            <style jsx global>{`
                /* Hide the "Powered by Google" branding if possible/allowed or make it subtle */
                .goog-te-gadget {
                    font-family: 'Outfit', sans-serif !important;
                    color: var(--text-secondary) !important;
                    font-size: 0px !important; /* Hides text */
                }
                .goog-te-gadget .goog-te-combo {
                    margin: 0 !important;
                    padding: 6px 10px !important;
                    border-radius: 20px !important;
                    background: var(--card-bg) !important;
                    border: 1px solid var(--border) !important;
                    color: var(--text-main) !important;
                    font-family: inherit !important;
                    font-size: 14px !important;
                    outline: none !important;
                    cursor: pointer !important;
                }
                /* Hide the top bar frame that Google sometimes injects */
                .goog-te-banner-frame {
                    display: none !important;
                }
                body {
                    top: 0px !important;
                }
            `}</style>
        </div>
    );
}
