'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Admin {
  id: string;
  name: string;
  email: string;
}

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('⚠️ Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data: { admin?: Admin; error?: string } = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');
      if (!data.admin) throw new Error('Invalid admin response');

      // ✅ Save session
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminId', data.admin.id);
      localStorage.setItem('adminName', data.admin.name);

      console.log('✅ Login success, redirecting...');

      // ✅ Force navigation
      router.push('/admin-page');
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded shadow-md mt-20">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img
          src="/images/Maathiyosi_Logo_Rect.png"
          alt="Maathiyosi"
          className="h-12 object-contain"
        />
      </div>
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>

      <input
        type="email"
        placeholder="Email"
        className="border p-3 w-full mb-4 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-3 w-full mb-6 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className={`w-full py-3 rounded text-white font-semibold transition-colors ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </div>
  );
}
