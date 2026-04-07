import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Car, ShieldAlert } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
         navigate('/admin');
      } else {
         navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-primary-dark p-10 rounded-2xl shadow-2xl border border-slate-800">
        <div className="text-center">
          <Car className="mx-auto h-12 w-12 text-secondary" />
          <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tighter uppercase">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to manage your bookings and vehicles
          </p>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-100 px-4 py-3 rounded-lg text-sm flex items-center">
            <span className="mr-2">⚠️</span> {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email Address</label>
              <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                 <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-secondary hover:text-secondary-light">
                Forgot password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-3 flex justify-center items-center"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'SIGN IN'
            )}
          </button>
        </form>

        <div className="text-center text-sm pt-4 border-t border-slate-800/50 mt-6">
          <p>
            <span className="text-gray-400">Don't have an account? </span>
            <Link to="/register" className="font-bold text-secondary hover:text-secondary-light transition-all">
              Create one for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
