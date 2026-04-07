import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Shield, Sparkles, Trophy, Calendar, MessageSquare } from 'lucide-react';
import api from '../api/axios';
import ServiceCard from '../components/ServiceCard';

const Home = () => {
  const [featuredServices, setFeaturedServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        setFeaturedServices(res.data.data.slice(0, 3));
      } catch (err) {
        console.error("Error fetching services:", err);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center bg-hero-pattern bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tighter mb-6 animate-fade-in-up">
              REVIVE YOUR <span className="text-secondary">CAR'S</span> SHOWROOM SHINE
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed ">
              Professional detailing services tailored for automotive enthusiasts. We bring precision, protection, and perfection to every vehicle.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/booking" className="btn-primary text-center">
                Book Appointment
              </Link>
              <Link to="/services" className="btn-outline text-center">
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary-dark py-12 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-white mb-1">5000+</div>
            <div className="text-gray-400 text-sm italic">Cars Detailed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">99%</div>
            <div className="text-gray-400 text-sm italic">Happy Clients</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">15+</div>
            <div className="text-gray-400 text-sm italic">Years Exp</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">24/7</div>
            <div className="text-gray-400 text-sm italic">Support</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">WHY CHOOSE US</h2>
          <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We don't just wash cars; we perform a comprehensive restoration process using the finest chemicals and tools.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Shield size={32} />, title: "Paint Protection", desc: "Premium ceramic coatings that last for years." },
            { icon: <Sparkles size={32} />, title: "Detailing Perfection", desc: "Every nook and cranny cleaned to perfection." },
            { icon: <Trophy size={32} />, title: "Quality Guaranteed", desc: "Multi-point inspection before delivery." }
          ].map((item, i) => (
            <div key={i} className="p-8 glass-morphism rounded-2xl border border-slate-800 text-center hover:border-secondary transition-all group">
              <div className="text-secondary mb-6 flex justify-center group-hover:scale-110 transition-transform">{item.icon}</div>
              <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-tighter">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24 bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-end mb-16">
          <div>
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">OUR PACKAGES</h2>
            <p className="text-gray-400">Select the perfect care for your ride.</p>
          </div>
          <Link to="/services" className="text-secondary font-bold hover:underline mb-2">View All Packages →</Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredServices.length > 0 ? (
            featuredServices.map(service => (
              <ServiceCard key={service._id} service={service} />
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500 py-20 italic">Loading our premium packages...</div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-8 tracking-tighter">READY TO FALL IN LOVE WITH YOUR CAR AGAIN?</h2>
          <p className="text-secondary-dark text-xl font-medium mb-12 max-w-2xl mx-auto">
            Book your professional detailing appointment today and experience the difference.
          </p>
          <Link to="/booking" className="bg-white text-secondary font-black py-4 px-12 rounded-full text-lg uppercase tracking-widest shadow-2xl hover:bg-gray-100 transition-all transform hover:scale-105">
            Book Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
