import Link from 'next/link';

export default function Header() {
    return (
        <header className="header">
            <div className="header-content">
                <Link href="/" className="logo">
                    My Blog
                </Link>
                <nav className="nav-links">
                    <Link href="/">Home</Link>
                    <Link href="/about">About</Link>
                    <Link href="/contact">Contact</Link>
                </nav>
            </div>
        </header>
    );
}