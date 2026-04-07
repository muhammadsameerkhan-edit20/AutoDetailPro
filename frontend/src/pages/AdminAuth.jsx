import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldAlert, Key, User, ArrowLeft } from 'lucide-react';

const AdminAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (isLogin) {
        const user = await login(email, password);
        if (user.role !== 'admin') {
           setError('ACCESS DENIED: Required admin permissions not found on this account.');
           return;
        }
        navigate('/admin');
      } else {
        await register({ name, email, password, role: 'admin', adminSecret });
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 border-t-2 border-secondary">
      <div className="max-w-md w-full space-y-8 bg-[#0a0a0a] p-10 rounded-2xl shadow-2xl border border-slate-800/50">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-secondary/10 flex items-center justify-center rounded-2xl border border-secondary/20 mb-6">
             <ShieldAlert className="text-secondary" size={32} />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            Command Center
          </h2>
          <p className="mt-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
            {isLogin ? 'Protected Area • Authorization Required' : 'Elite Access • System Onboarding'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-xs font-bold flex items-center animate-in shake-in">
            <span className="mr-2">❌</span> {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <label className="text-[10px] font-black text-gray-600 uppercase mb-1 block">Full Name</label>
                <div className="relative">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                   <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 bg-black border-slate-800 text-sm py-3" placeholder="SYSTEM OPERATOR NAME" />
                </div>
              </div>
            )}
            
            <div className="relative">
              <label className="text-[10px] font-black text-gray-600 uppercase mb-1 block">Work Email</label>
              <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                 <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 bg-black border-slate-800 text-sm py-3" placeholder="OFFICIAL@AUTODETAILPRO.COM" />
              </div>
            </div>

            <div className="relative">
              <label className="text-[10px] font-black text-gray-600 uppercase mb-1 block">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 bg-black border-slate-800 text-sm py-3" placeholder="••••••••" />
              </div>
            </div>

            {!isLogin && (
              <div className="relative">
                <label className="text-[10px] font-black text-secondary uppercase mb-1 block">Admin Master Secret Key</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/70" size={16} />
                  <input type="password" required value={adminSecret} onChange={e => setAdminSecret(e.target.value)} className="w-full pl-10 bg-secondary/5 border-secondary/20 text-secondary text-sm py-3 focus:border-secondary" placeholder="MASTER_SECRET_KEY" />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-secondary hover:bg-secondary-light text-white font-black py-4 uppercase tracking-[0.2em] text-xs transition-all flex justify-center items-center shadow-lg"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              isLogin ? 'INITIATE LOGIN' : 'CREATE ADMIN ACCESS'
            )}
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] font-bold mt-6 pt-6 border-t border-slate-900">
           <button onClick={() => setIsLogin(!isLogin)} className="text-secondary hover:underline uppercase tracking-widest transition-all">
              {isLogin ? '→ Register New Administrator' : '← Return to Admin Login'}
           </button>
           <button onClick={() => navigate('/login')} className="text-gray-600 hover:text-white flex items-center uppercase tracking-widest gap-2">
              <ArrowLeft size={12} /> Public Portal
           </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
