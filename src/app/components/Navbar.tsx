'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { createClientComponentClient } from '../components/lib/supabaseClient';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // ✅ Check if user is logged in on load
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();

    // ✅ Listen for login/logout changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
  };

  return (
    <nav className="bg-[#fff1f1] shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-[#de5252]">
            Maathiyosi
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            <NavLink href="/" label="Home" />
            <NavLink href="/courses" label="Courses" />
            <NavLink href="/contact" label="Contact" />

            {/* ✅ Login button or Profile Pic Dropdown */}
            {!session ? (
              <NavLink href="/student-login" label="Login" />
            ) : (
              <div className="relative">
                {/* Profile picture */}
                <img
                  src={session.user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-8 h-8 rounded-full cursor-pointer"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                />

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border">
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Account Details
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
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

          {/* ✅ Mobile: show Login OR Profile pic menu */}
          {!session ? (
            <MobileNavLink href="/student-login" label="Login" />
          ) : (
            <div className="mt-2">
              <img
                src={session.user.user_metadata.avatar_url}
                alt="Profile"
                className="w-8 h-8 rounded-full cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
              {dropdownOpen && (
                <div className="mt-2 w-40 bg-white rounded-md shadow-lg border">
                  <Link
                    href="/account"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Account Details
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
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
