'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const links = [
    { href: '/tracker', label: 'Tracker' },
    { href: '/todo', label: 'ToDo' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/month-view', label: 'Month View' },
    { href: '/setup', label: 'Setup' },
  ];
  return (
    <nav className="top-nav">
      {links.map(l => (
        <Link key={l.href} href={l.href} className={pathname === l.href ? 'active' : ''}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
