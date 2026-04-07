import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Car, LogOut, User, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
  ];

  if (user) {
    navLinks.push({ name: 'Dashboard', path: '/dashboard' });
  }

  return (
    <nav className="bg-primary-dark border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <Car className="h-10 w-10 text-secondary transition-transform group-hover:rotate-12" />
              <span className="text-2xl font-bold text-white tracking-tighter">
                AUTO<span className="text-secondary">DETAIL</span>PRO
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-gray-300 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-slate-700">
                  <span className="text-gray-400 text-sm">Hi, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-primary px-2 pt-2 pb-3 space-y-1 sm:px-3 animate-fade-in-down">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-gray-300 hover:text-secondary block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {!user ? (
            <>
              <Link
                to="/login"
                className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-secondary text-white block px-3 py-2 rounded-md text-base font-medium text-center"
                onClick={() => setIsOpen(false)}
              >
                Sign Up
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full text-left text-red-400 hover:text-red-500 block px-3 py-2 text-base font-medium"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
