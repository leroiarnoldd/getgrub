import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';
import { Overview } from './pages/Overview';
import { Deals } from './pages/Deals';
import { Feedback } from './pages/Feedback';
import { Billing } from './pages/Billing';
import { Settings } from './pages/Settings';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-getgrub-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-sm">
        <h1 className="text-3xl font-black text-getgrub-navy mb-2">Get Grub</h1>
        <p className="text-gray-500 mb-8">Restaurant partner dashboard</p>

        <form onSubmit={handleSignIn} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-getgrub-navy mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-getgrub-navy focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-getgrub-navy mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-getgrub-navy focus:outline-none focus:ring-2 focus:ring-getgrub-coral"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-getgrub-coral text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:bg-opacity-90 transition"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const handleSignOut = () => supabase.auth.signOut();

  const navItems = [
    { to: '/overview', label: 'Overview' },
    { to: '/deals', label: 'Deals' },
    { to: '/feedback', label: 'Feedback' },
    { to: '/billing', label: 'Billing' },
    { to: '/settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-getgrub-navy text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-black">Get Grub</h1>
          <p className="text-white/60 text-xs mt-1">Partner Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive ? 'bg-getgrub-coral text-white' : 'text-white/70 hover:bg-white/10'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="text-white/60 text-sm hover:text-white transition"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-getgrub-cream">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-getgrub-cream flex items-center justify-center">
        <div className="text-getgrub-coral text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}
