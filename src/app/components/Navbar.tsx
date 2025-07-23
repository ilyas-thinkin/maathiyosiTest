'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-[#fff1f1] shadow-md fixed top-0 left-0 w-full z-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-[#de5252]">
            Maathiyosi
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            <NavLink href="/" label="Home" />
            <NavLink href="/courses" label="Courses" />
            <NavLink href="/contact" label="Contact" />
            <NavLink href="/login" label="Login" />
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden">
            <button onClick={() => setOpen(!open)}>
              {open ? <X size={24} color="#de5252" /> : <Menu size={24} color="#de5252" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden px-4 pb-4 bg-[#fff1f1]">
          <MobileNavLink href="/" label="Home" />
          <MobileNavLink href="/courses" label="Courses" />
          <MobileNavLink href="/contact" label="Contact" />
          <MobileNavLink href="/login" label="Login" />
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-[#7f1d1d] hover:text-[#b91c1c] text-sm font-medium"
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block text-[#7f1d1d] hover:text-[#b91c1c] py-2"
    >
      {label}
    </Link>
  );
}
