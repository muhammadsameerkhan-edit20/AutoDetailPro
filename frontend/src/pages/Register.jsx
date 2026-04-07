import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Car, ShieldCheck, Sparkles } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsSubmitting(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-primary-dark p-10 rounded-2xl shadow-2xl border border-slate-800">
        <div className="text-center">
          <Sparkles className="mx-auto h-12 w-12 text-secondary" />
          <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tighter uppercase">
            Join the Club
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Exclusive detailing benefits start here
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
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Full Name</label>
              <div className="relative">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                 <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email Address</label>
              <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                 <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="relative">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Confirm Password</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>
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
              'CREATE ACCOUNT'
            )}
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-400">Already a member? </span>
          <Link to="/login" className="font-bold text-secondary hover:text-secondary-light">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
