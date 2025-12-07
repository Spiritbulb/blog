'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';

export default function Header() {
    const [darkMode, setDarkMode] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Check localStorage first
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            const isDark = storedTheme === 'dark';
            setDarkMode(isDark);
            document.documentElement.setAttribute('data-theme', storedTheme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setDarkMode(prefersDark);
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
    }, []);

    const toggleDarkMode = () => {
        const newTheme = darkMode ? 'light' : 'dark';
        setDarkMode(!darkMode);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    // Prevent flash of incorrect theme
    if (!mounted) {
        return null;
    }

    return (
        <header className="header">
            <div className="header-content">
                <Link href="/" className="logo">
                    <img src={darkMode ? '/logo-w.png' : '/logo-sb.png'} alt="Logo" />
                </Link>

                {/* Desktop Navigation */}
                <nav className="nav-links">
                    <Link href="/the-truth-about-a-student-network">Nuru</Link>
                    <Link href="/the-easiest-social-marketplace-experience">Reach</Link>
                    <Link href="/take-a-break-you-deserve-it">Tufike</Link>
                    <Link href="/building-a-country-thats-more-connected">Menengai Cloud</Link>
                    <button onClick={toggleDarkMode} className="dark-mode-toggle">
                        {darkMode ? <Sun className='w-5 h-5' /> : <Moon className='w-5 h-5' />}
                    </button>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMobileMenu}
                    className="mobile-menu-button"
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <Link href="/the-truth-about-a-student-network" onClick={() => setMobileMenuOpen(false)}>
                    Nuru
                </Link>
                <Link href="/the-easiest-social-marketplace-experience" onClick={() => setMobileMenuOpen(false)}>
                    Reach
                </Link>
                <Link href="/take-a-break-you-deserve-it" onClick={() => setMobileMenuOpen(false)}>
                    Tufike
                </Link>
                <Link href="/building-a-country-thats-more-connected" onClick={() => setMobileMenuOpen(false)}>
                    Menengai Cloud
                </Link>
                <button onClick={toggleDarkMode} className="dark-mode-toggle">
                    {darkMode ? (
                        <>
                            <Sun className='w-5 h-5' />
                            <span style={{ marginLeft: '0.5rem' }}>Light Mode</span>
                        </>
                    ) : (
                        <>
                            <Moon className='w-5 h-5' />
                            <span style={{ marginLeft: '0.5rem' }}>Dark Mode</span>
                        </>
                    )}
                </button>
            </div>
        </header>
    );
}