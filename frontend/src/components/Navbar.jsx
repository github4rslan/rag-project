import { BotMessageSquare, LogOut, User } from 'lucide-react';
import { useAuth }     from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="h-14 bg-black border-b border-white/10 flex items-center
    px-6 gap-3 flex-shrink-0">
      {/* Logo */}
      <div className="w-8 h-8 bg-[#00ff88] rounded-lg flex items-center
      justify-center glow-green">
        <BotMessageSquare size={18} className="text-black" />
      </div>
      <span className="text-white font-bold text-lg font-mono">
        RAG<span className="text-[#00ff88]">.ai</span>
      </span>

      {/* Status */}
      <div className="flex items-center gap-2 ml-4">
        <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
        <span className="text-white/20 text-xs font-mono">system online</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="text-white/30 text-xs font-mono hidden md:block">
          {user?.email}
        </span>

        {/* Profile button */}
        <button onClick={() => navigate('/profile')}
          className="flex items-center gap-2 px-3 py-1.5 border border-white/10
          hover:border-[#00ff88]/50 text-white/40 hover:text-[#00ff88]
          rounded-lg text-xs font-mono transition-all">
          <User size={13} />
          profile
        </button>

        {/* Logout button */}
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 border border-white/10
          hover:border-red-500/50 text-white/40 hover:text-red-400
          rounded-lg text-xs font-mono transition-all">
          <LogOut size={13} />
          logout
        </button>
      </div>
    </nav>
  );
}