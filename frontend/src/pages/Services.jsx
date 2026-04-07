import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import ServiceCard from '../components/ServiceCard';
import { Sparkles, Filter, Search } from 'lucide-react';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        setServices(res.data.data);
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filteredServices = services.filter(service => {
    const matchesFilter = filter === 'all' || service.category === filter;
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const categories = ['all', 'exterior', 'interior', 'full-detail', 'ceramic-coating'];

  return (
    <div className="min-h-screen bg-dark py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Sparkles className="mx-auto h-12 w-12 text-secondary mb-4" />
          <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tighter uppercase">
            Our <span className="text-secondary">Signature</span> Packages
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Choose from our range of professional detailing services designed to protect and enhance your vehicle's appearance.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 glass-morphism p-6 rounded-2xl border border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
             <Filter size={18} className="text-secondary mr-2" />
             {categories.map(cat => (
               <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all ${
                  filter === cat ? 'bg-secondary text-white' : 'bg-primary-dark text-gray-400 hover:text-white'
                }`}
               >
                 {cat.replace('-', ' ')}
               </button>
             ))}
          </div>

          <div className="relative w-full md:w-64">
             <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
             <input
              type="text"
              placeholder="Search services..."
              className="w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
             <div className="h-12 w-12 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.length > 0 ? (
              filteredServices.map(service => (
                <ServiceCard key={service._id} service={service} />
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-500 italic text-xl">No services found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
