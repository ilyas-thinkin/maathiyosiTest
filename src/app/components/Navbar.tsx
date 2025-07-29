'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { createClientComponentClient } from "@/app/components/lib/supabaseClient";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const supabase = createClientComponentClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Fetch logged-in user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // ✅ Close dropdown if clicked outside
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [supabase]);

  // ✅ Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/"; // refresh to reset state
  };

  return (
    <nav className="bg-[#fff1f1] shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ✅ Logo */}
          <Link href="/" className="text-2xl font-bold text-[#de5252]">
            Maathiyosi
          </Link>

          {/* ✅ Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            <NavLink href="/" label="Home" />
            <NavLink href="/courses" label="Courses" />
            <NavLink href="/contact" label="Contact" />

            {!user ? (
              <NavLink href="/student-login" label="Login" />
            ) : (
              <div className="relative" ref={dropdownRef}>
                {/* ✅ Profile picture */}
                <img
                  src={user.user_metadata?.avatar_url || "/default-avatar.png"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full cursor-pointer border border-gray-300"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                />

                {/* ✅ Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2">
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Account Details
                    </Link>
                    <Link
                      href="/my-courses"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Courses
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ✅ Mobile Menu Icon */}
          <div className="md:hidden">
            <button onClick={() => setOpen(!open)}>
              {open ? <X size={24} color="#de5252" /> : <Menu size={24} color="#de5252" />}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Mobile Dropdown Menu */}
      {open && (
        <div className="md:hidden px-4 pb-4 bg-[#fff1f1]">
          <MobileNavLink href="/" label="Home" />
          <MobileNavLink href="/courses" label="Courses" />
          <MobileNavLink href="/contact" label="Contact" />
          {!user ? (
            <MobileNavLink href="/student-login" label="Login" />
          ) : (
            <>
              <MobileNavLink href="/account" label="Account Details" />
              <MobileNavLink href="/my-courses" label="My Courses" />
              <button
                onClick={handleLogout}
                className="block text-left text-red-600 py-2 w-full"
              >
                Logout
              </button>
            </>
          )}
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
