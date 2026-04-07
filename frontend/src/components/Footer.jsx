import React from 'react';
import { Car, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark-dark border-t border-slate-900 pt-16 pb-8 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <Car className="h-8 w-8 text-secondary" />
              <span className="text-xl font-bold text-white tracking-tighter">
                AUTO<span className="text-secondary">DETAIL</span>PRO
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Premium automotive detailing services for those who demand excellence. We bring the sparkle back to your vehicle with professional care.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="hover:text-secondary transition-colors"><Instagram size={20} /></a>
              <a href="#" className="hover:text-secondary transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-secondary transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Quick Links</h3>
            <ul className="space-y-4 text-sm">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">Services</a></li>
              <li><a href="/booking" className="hover:text-white transition-colors">Book Appointment</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center space-x-3">
                <MapPin size={16} className="text-secondary" />
                <span>123 Detailer Ave, Auto City</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={16} className="text-secondary" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={16} className="text-secondary" />
                <span>support@autodetailpro.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Working Hours</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex justify-between">
                <span>Mon - Fri:</span>
                <span className="text-white">8:00 AM - 6:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday:</span>
                <span className="text-white">9:00 AM - 5:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday:</span>
                <span className="text-secondary font-medium">Closed</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-900 pt-8 mt-8 text-center text-xs">
          <p>© {new Date().getFullYear()} AutoDetailPro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
