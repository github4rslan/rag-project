import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../utils/api';

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await registerUser(form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-mono font-bold text-white">
            RAG<span className="text-[#00ff88] glow-text">.ai</span>
          </h1>
          <p className="text-white/30 text-sm mt-2 font-mono">
            // chat with your documents
          </p>
        </div>

        {/* Card */}
        <div className="bg-black border border-white/10 rounded-2xl p-8
        hover:border-[#00ff88]/30 transition-all duration-300">
          <h2 className="text-white font-semibold text-lg mb-6 font-mono">
            &gt; create account
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30
            rounded-lg text-red-400 text-sm font-mono">
              ✗ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-white/40 text-xs font-mono mb-1.5 block">NAME</label>
              <input
                type="text"
                placeholder="Arslan"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                text-white text-sm font-mono placeholder-white/20 outline-none
                focus:border-[#00ff88]/50 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-white/40 text-xs font-mono mb-1.5 block">EMAIL</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                text-white text-sm font-mono placeholder-white/20 outline-none
                focus:border-[#00ff88]/50 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-white/40 text-xs font-mono mb-1.5 block">PASSWORD</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                text-white text-sm font-mono placeholder-white/20 outline-none
                focus:border-[#00ff88]/50 transition-all"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00ff88] hover:bg-[#00cc6a] disabled:opacity-40
              text-black font-bold font-mono rounded-xl transition-all duration-200
              glow-green hover:scale-[1.02] active:scale-[0.98] mt-2"
            >
              {loading ? '// creating...' : '> create account'}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm font-mono mt-6">
            have an account?{' '}
            <Link to="/login" className="text-[#00ff88] hover:underline">
              login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}