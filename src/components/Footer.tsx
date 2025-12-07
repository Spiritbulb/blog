'use client';
import Link from 'next/link';
import { Twitter, Github, Mail, Linkedin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-top">
                    <div className="footer-brand">
                        <h3>Building Tomorrow's Digital Infrastructure</h3>
                        <p>Connecting communities through innovative solutions.</p>
                    </div>
                    <div className="footer-sections">
                        <div className="footer-section">
                            <h4>Products</h4>
                            <Link href="/the-truth-about-a-student-network">Nuru</Link>
                            <Link href="/the-easiest-social-marketplace-experience">Reach</Link>
                            <Link href="/take-a-break-you-deserve-it">Tufike</Link>
                            <Link href="/building-a-country-thats-more-connected">Menengai Cloud</Link>
                        </div>
                        <div className="footer-section">
                            <h4>Company</h4>
                            <Link href="https://spiritbulb.org">About</Link>
                            <Link href="https://spiritbulb.org/contact">Contact</Link>
                        </div>
                        <div className="footer-section">
                            <h4>Connect</h4>
                            <div className="footer-social">
                                <a href="https://twitter.com/spiritbulb" target="_blank" rel="noopener noreferrer">
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a href="https://github.com/spiritbulb" target="_blank" rel="noopener noreferrer">
                                    <Github className="w-5 h-5" />
                                </a>
                                <a href="https://linkedin.com/company/spiritbulb" target="_blank" rel="noopener noreferrer">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                                <a href="mailto:hello@spiritbulb.org">
                                    <Mail className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Spiritbulb. All rights reserved.</p>
                    <div className="footer-legal">
                        <Link href="https://spiritbulb.org/privacy">Privacy Policy</Link>
                        <Link href="https://spiritbulb.org/terms">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}