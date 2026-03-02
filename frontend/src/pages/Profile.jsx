import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { useAuth }             from '../context/AuthContext';
import {
  getProfile, updateProfile,
  changePassword, deleteAccount,
} from '../utils/api';
import {
  User, Lock, Trash2, ArrowLeft,
  FileText, MessageSquare, Calendar,
  CheckCircle, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout, login } = useAuth();
  const navigate                = useNavigate();

  const [stats, setStats]   = useState({ totalDocs: 0, totalChats: 0 });
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName]           = useState('');
  const [nameLoading, setNameLoading] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [passLoading, setPassLoading] = useState(false);

  const [showDelete, setShowDelete]     = useState(false);
  const [deleteInput, setDeleteInput]   = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      setStats(res.data.stats);
      setName(res.data.user.name);
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Update name
  const handleUpdateName = async (e) => {
    e.preventDefault();
    setNameLoading(true);
    try {
      const res = await updateProfile({ name });
      login(localStorage.getItem('token'), res.data.user);
      toast.success('// name_updated()');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setNameLoading(false); }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setPassLoading(true);
    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword:     passwords.newPassword,
      });
      toast.success('// password_changed()');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPassLoading(false); }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteInput !== user?.email) {
      return toast.error('Email does not match');
    }
    setDeleteLoading(true);
    try {
      await deleteAccount();
      logout();
      navigate('/login');
      toast.success('Account deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    } finally {
      setDeleteLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full bg-black">
      <div className="text-[#00ff88] font-mono animate-pulse">// loading_profile...</div>
    </div>
  );

  return (
    <div className="flex-1 bg-black overflow-y-auto">
      {/* Background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,136,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">

        {/* Back button */}
        <button onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/30 hover:text-[#00ff88]
          font-mono text-sm transition-all w-fit">
          <ArrowLeft size={16} />
          back_to_chat()
        </button>

        {/* Profile header */}
        <div className="bg-black border border-white/10 hover:border-[#00ff88]/20
        rounded-2xl p-6 transition-all">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 bg-[#00ff88]/10 border border-[#00ff88]/30
            rounded-2xl flex items-center justify-center glow-green flex-shrink-0">
              <span className="text-[#00ff88] font-mono font-bold text-2xl">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-white font-mono font-bold text-xl">{user?.name}</h1>
              <p className="text-white/30 font-mono text-sm">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
                <span className="text-[#00ff88] text-xs font-mono">active</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { icon: FileText,      label: 'documents', value: stats.totalDocs  },
              { icon: MessageSquare, label: 'chats',     value: stats.totalChats },
              { icon: Calendar,      label: 'joined',    value: 'recently'       },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <Icon size={16} className="text-[#00ff88] mx-auto mb-1" />
                <p className="text-white font-mono font-bold text-lg">{value}</p>
                <p className="text-white/30 font-mono text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Update name */}
        <div className="bg-black border border-white/10 hover:border-[#00ff88]/20
        rounded-2xl p-6 transition-all">
          <div className="flex items-center gap-2 mb-5">
            <User size={16} className="text-[#00ff88]" />
            <h2 className="text-white font-mono font-semibold">&gt; update_profile</h2>
          </div>

          <form onSubmit={handleUpdateName} className="flex flex-col gap-4">
            <div>
              <label className="text-white/30 text-xs font-mono mb-1.5 block">
                DISPLAY NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl
                px-4 py-3 text-white text-sm font-mono placeholder-white/20
                outline-none focus:border-[#00ff88]/50 transition-all"
                required
              />
            </div>
            <button type="submit" disabled={nameLoading}
              className="w-full py-3 bg-[#00ff88]/10 hover:bg-[#00ff88]/20
              border border-[#00ff88]/30 hover:border-[#00ff88]/60
              text-[#00ff88] font-mono text-sm rounded-xl transition-all
              disabled:opacity-40">
              {nameLoading ? '// saving...' : '> save_changes()'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-black border border-white/10 hover:border-[#00ff88]/20
        rounded-2xl p-6 transition-all">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={16} className="text-[#00ff88]" />
            <h2 className="text-white font-mono font-semibold">&gt; change_password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            {[
              { label: 'CURRENT PASSWORD', key: 'currentPassword', placeholder: '••••••••' },
              { label: 'NEW PASSWORD',     key: 'newPassword',     placeholder: '••••••••' },
              { label: 'CONFIRM PASSWORD', key: 'confirmPassword', placeholder: '••••••••' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="text-white/30 text-xs font-mono mb-1.5 block">
                  {label}
                </label>
                <input
                  type="password"
                  placeholder={placeholder}
                  value={passwords[key]}
                  onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl
                  px-4 py-3 text-white text-sm font-mono placeholder-white/20
                  outline-none focus:border-[#00ff88]/50 transition-all"
                  required
                />
              </div>
            ))}

            {/* Password match indicator */}
            {passwords.confirmPassword && (
              <div className={`flex items-center gap-2 text-xs font-mono
                ${passwords.newPassword === passwords.confirmPassword
                  ? 'text-[#00ff88]' : 'text-red-400'}`}>
                {passwords.newPassword === passwords.confirmPassword
                  ? <><CheckCircle size={12} /> passwords match</>
                  : <><AlertCircle size={12} /> passwords do not match</>
                }
              </div>
            )}

            <button type="submit" disabled={passLoading}
              className="w-full py-3 bg-[#00ff88]/10 hover:bg-[#00ff88]/20
              border border-[#00ff88]/30 hover:border-[#00ff88]/60
              text-[#00ff88] font-mono text-sm rounded-xl transition-all
              disabled:opacity-40">
              {passLoading ? '// updating...' : '> change_password()'}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="bg-black border border-red-500/20 hover:border-red-500/40
        rounded-2xl p-6 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 size={16} className="text-red-400" />
            <h2 className="text-red-400 font-mono font-semibold">&gt; danger_zone</h2>
          </div>
          <p className="text-white/30 text-xs font-mono mb-5">
            // permanently deletes your account, documents and chat history
          </p>

          {!showDelete ? (
            <button onClick={() => setShowDelete(true)}
              className="w-full py-3 bg-red-500/10 hover:bg-red-500/20
              border border-red-500/30 hover:border-red-500/60
              text-red-400 font-mono text-sm rounded-xl transition-all">
              &gt; delete_account()
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-white/40 text-xs font-mono">
                type your email to confirm: <span className="text-red-400">{user?.email}</span>
              </p>
              <input
                type="email"
                placeholder={user?.email}
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="w-full bg-red-500/5 border border-red-500/20 rounded-xl
                px-4 py-3 text-white text-sm font-mono placeholder-white/20
                outline-none focus:border-red-500/50 transition-all"
              />
              <div className="flex gap-3">
                <button onClick={() => { setShowDelete(false); setDeleteInput(''); }}
                  className="flex-1 py-3 bg-white/5 border border-white/10
                  text-white/40 font-mono text-sm rounded-xl transition-all
                  hover:bg-white/10">
                  cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== user?.email || deleteLoading}
                  className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30
                  border border-red-500/40 text-red-400 font-mono text-sm
                  rounded-xl transition-all disabled:opacity-30">
                  {deleteLoading ? '// deleting...' : 'confirm_delete()'}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}