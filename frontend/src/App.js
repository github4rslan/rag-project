import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster }   from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login    from './pages/Login';
import Register from './pages/Register';
import Home     from './pages/Home';
import Profile  from './pages/Profile';
import Navbar   from './components/Navbar';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-[#00ff88] font-mono animate-pulse">// loading...</div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={
        <ProtectedRoute>
          <div className="flex flex-col h-screen bg-black overflow-hidden">
            <Navbar />
            <Home />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <div className="flex flex-col h-screen bg-black overflow-hidden">
            <Navbar />
            <Profile />
          </div>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#000',
            color: '#00ff88',
            border: '1px solid rgba(0,255,136,0.3)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
          }
        }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}