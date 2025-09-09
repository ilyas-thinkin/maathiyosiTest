'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut, BookOpen, Settings, LayoutDashboard } from 'lucide-react';
import { createClientComponentClient } from "@/app/components/lib/supabaseClient";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const supabase = createClientComponentClient();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // ✅ Load current user on initial load
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // ✅ Listen for auth state changes
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // ✅ Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 fixed top-0 left-0 w-full z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              Maathiyosi.io
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="/" label="Home" />
            <NavLink href="/courses" label="Courses" />
            <NavLink href="/contact" label="Contact" />

            {!user ? (
              <button
                onClick={() => router.push("/login")}
                className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                Login
              </button>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={user.user_metadata?.avatar_url || "/default-avatar.png"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      href="/account"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Account Settings</span>
                    </Link>

                    <Link
                      href="/my-courses"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>My Courses</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {open ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            <MobileNavLink href="/" label="Home" setOpen={setOpen} />
            <MobileNavLink href="/courses" label="Courses" setOpen={setOpen} />
            <MobileNavLink href="/contact" label="Contact" setOpen={setOpen} />

            {!user ? (
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/login");
                }}
                className="block w-full bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-3 rounded-lg font-medium text-center"
              >
                Login
              </button>
            ) : (
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <img
                    src={user.user_metadata?.avatar_url || "/default-avatar.png"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-gray-200"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>

                <MobileNavLink href="/dashboard" label="Dashboard" setOpen={setOpen} />
                <MobileNavLink href="/account" label="Account Settings" setOpen={setOpen} />
                <MobileNavLink href="/my-courses" label="My Courses" setOpen={setOpen} />

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-gray-700 hover:text-red-600 font-medium transition-colors relative group"
    >
      {label}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-pink-600 transition-all duration-200 group-hover:w-full"></span>
    </Link>
  );
}

function MobileNavLink({ href, label, setOpen }: { href: string; label: string; setOpen: (open: boolean) => void }) {
  return (
    <Link
      href={href}
      className="block text-gray-700 hover:text-red-600 font-medium py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
      onClick={() => setOpen(false)}
    >
      {label}
    </Link>
  );
}
