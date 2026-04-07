import React from 'react';
import { Clock, DollarSign, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();

  return (
    <div className="card group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={service.thumbnail ? `http://localhost:5001${service.thumbnail}` : `https://source.unsplash.com/featured/?car,detailing,${service.name.split(' ')[0].replace(/[^a-zA-Z]/g, '')}`}
          alt={service.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 bg-secondary text-white font-bold py-1 px-3 rounded-full text-sm shadow-lg">
          Rs. {service.price}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-secondary transition-colors uppercase tracking-tight">
          {service.name}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {service.description}
        </p>
        
        <div className="flex items-center space-x-4 mb-6 text-gray-400 text-sm">
          <div className="flex items-center">
            <Clock size={16} className="text-secondary mr-2" />
            <span>{service.duration} mins</span>
          </div>
          <div className="flex items-center">
            <CheckCircle2 size={16} className="text-green-500 mr-2" />
            <span>Premium Care</span>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/booking', { state: { serviceId: service._id } })}
          className="w-full btn-primary"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;
