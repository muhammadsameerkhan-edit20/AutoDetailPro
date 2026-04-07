import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import axios from 'axios';
import { Calendar as CalendarIcon, Clock, Car as VehicleIcon, Sparkles, CreditCard, ChevronRight, AlertCircle, MapPin, Search } from 'lucide-react';

// OpenStreetMap & Leaflet explicitly replaces paid Google Maps
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon not showing correctly in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to handle clicking on the map
const LocationSelector = ({ bookingData, setBookingData }) => {
  useMapEvents({
    click(e) {
      setBookingData(prev => ({
        ...prev,
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        address: 'Custom Dropped Pin Location'
      }));
    },
  });
  return bookingData.lat && bookingData.lng ? (
    <Marker position={[bookingData.lat, bookingData.lng]} />
  ) : null;
};

const Booking = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const [bookingData, setBookingData] = useState({
    service: location.state?.serviceId || '',
    vehicle: '',
    bookingDate: '',
    timeSlot: '',
    address: '',
    lat: 40.7128, // Default to NYC
    lng: -74.0060,
    paymentMethod: 'credit_card'
  });

  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/booking', serviceId: bookingData.service } });
      return;
    }

    const fetchData = async () => {
      try {
        const [servRes, vehRes] = await Promise.all([
          api.get('/services'),
          api.get('/vehicles')
        ]);
        setServices(servRes.data.data);
        setVehicles(vehRes.data.data);
        
        if (vehRes.data.data.length > 0) {
          setBookingData(prev => ({ ...prev, vehicle: vehRes.data.data[0]._id }));
        }

        // Try to get actual user location using browser geolocation API
        if ("geolocation" in navigator) {
           navigator.geolocation.getCurrentPosition((position) => {
              setBookingData(prev => ({
                 ...prev,
                 lat: position.coords.latitude,
                 lng: position.coords.longitude
              }));
           });
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError('Failed to load data. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  // Use Free OpenStreetMap Nominatim for Address Search
  const handleAddressSearch = async (e) => {
    e.preventDefault();
    if (!bookingData.address) return;
    
    setSearchLoading(true);
    setError('');
    
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(bookingData.address)}`);
      if (res.data && res.data.length > 0) {
        const firstHit = res.data[0];
        setBookingData({
          ...bookingData,
          lat: parseFloat(firstHit.lat),
          lng: parseFloat(firstHit.lon),
          address: firstHit.display_name
        });
      } else {
        setError('Address not found. Please try a different search or drop a pin on the map below.');
      }
    } catch (err) {
      console.error(err);
      setError('Error searching address.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleBooking = async () => {
    setError('');
    try {
      const res = await api.post('/bookings', {
        vehicle: bookingData.vehicle,
        service: bookingData.service,
        bookingDate: bookingData.bookingDate,
        timeSlot: bookingData.timeSlot,
        location: {
           address: bookingData.address || 'Manual Location Input',
           lat: bookingData.lat,
           lng: bookingData.lng
        }
      });
      
      const bookingId = res.data.data._id;
      const amount = services.find(s => s._id === bookingData.service)?.price || 0;

      await api.post('/payments', {
        bookingId,
        amount,
        paymentMethod: bookingData.paymentMethod
      });

      navigate('/dashboard', { state: { success: 'Booking confirmed and payment processed!' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Try again.');
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="h-12 w-12 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
                step >= s ? 'bg-secondary border-secondary text-white' : 'border-slate-700 text-gray-500'
              }`}>
                {s}
              </div>
              {s < 4 && <div className={`w-16 h-0.5 ${step > s ? 'bg-secondary' : 'bg-slate-700'}`}></div>}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-primary-dark rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles size={120} className="text-secondary" />
          </div>

          {error && (
            <div className="mb-8 bg-red-900/30 border border-red-500 text-red-100 px-4 py-3 rounded-xl text-sm flex items-center relative z-10 animate-fade-in">
              <AlertCircle size={18} className="mr-2" /> {error}
            </div>
          )}

          {/* Step 1: Vehicle & Service */}
          {step === 1 && (
            <div className="animate-fade-in relative z-10">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <VehicleIcon className="mr-3 text-secondary" /> SELECT VEHICLE & SERVICE
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Your Vehicles</label>
                    <select 
                      value={bookingData.vehicle} 
                      onChange={(e) => setBookingData({...bookingData, vehicle: e.target.value})}
                      className="w-full"
                    >
                      {vehicles.length > 0 ? (
                        vehicles.map(v => (
                          <option key={v._id} value={v._id}>{v.make} {v.model} ({v.licensePlate})</option>
                        ))
                      ) : (
                        <option disabled>No vehicles added yet</option>
                      )}
                    </select>
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="text-secondary text-xs mt-2 hover:underline font-bold"
                    >
                      + Add new vehicle in dashboard
                    </button>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Detailing Package</label>
                    <select 
                      value={bookingData.service} 
                      onChange={(e) => setBookingData({...bookingData, service: e.target.value})}
                      className="w-full"
                    >
                      <option value="" disabled>Choose a package</option>
                      {services.map(s => (
                        <option key={s._id} value={s._id}>{s.name} - Rs. {s.price}</option>
                      ))}
                    </select>
                 </div>
              </div>

              <div className="mt-12 flex justify-end">
                <button 
                  onClick={nextStep} 
                  disabled={!bookingData.vehicle || !bookingData.service}
                  className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  CONTINUE <ChevronRight size={18} className="ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Location (Fully Free OpenStreetMap Integration) */}
          {step === 2 && (
            <div className="animate-fade-in relative z-10">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <MapPin className="mr-3 text-secondary" /> SERVICE LOCATION
              </h2>
              
              <div className="grid grid-cols-1 gap-6">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Search Property Address</label>
                    <form onSubmit={handleAddressSearch} className="flex gap-2">
                       <input 
                         type="text"
                         placeholder="Enter an address (e.g. 123 Main St, New York)..."
                         className="flex-1"
                         value={bookingData.address}
                         onChange={(e) => setBookingData({...bookingData, address: e.target.value})}
                       />
                       <button 
                         type="submit" 
                         disabled={searchLoading}
                         className="bg-secondary text-white px-6 rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center"
                       >
                         {searchLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Search size={18} className="mr-2" /> FIND</>}
                       </button>
                    </form>
                    <p className="text-xs text-secondary mt-2 font-bold uppercase">* Or click anywhere on the map to manually drop your pin!</p>
                 </div>

                 <div className="w-full h-80 rounded-2xl overflow-hidden border-2 border-slate-700 relative z-0">
                    <MapContainer 
                       center={[bookingData.lat, bookingData.lng]} 
                       zoom={13} 
                       scrollWheelZoom={true} 
                       style={{ height: '100%', width: '100%' }}
                    >
                       <TileLayer
                         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                       />
                       {/* This component handles custom click markers */}
                       <LocationSelector bookingData={bookingData} setBookingData={setBookingData} />
                    </MapContainer>
                 </div>
              </div>

              <div className="mt-12 flex justify-between">
                <button onClick={prevStep} className="btn-outline">BACK</button>
                <button 
                  onClick={nextStep} 
                  disabled={!bookingData.address && bookingData.address !== 'Custom Dropped Pin Location'}
                  className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  CONTINUE <ChevronRight size={18} className="ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Date & Time */}
          {step === 3 && (
            <div className="animate-fade-in relative z-10">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <CalendarIcon className="mr-3 text-secondary" /> SCHEDULE APPOINTMENT
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-4 block">Select Date</label>
                    <input 
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingData.bookingDate}
                      onChange={(e) => setBookingData({...bookingData, bookingDate: e.target.value})}
                      className="w-full text-lg py-4"
                    />
                 </div>

                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-4 block">Available Slots</label>
                    <div className="grid grid-cols-3 gap-3">
                      {timeSlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setBookingData({...bookingData, timeSlot: slot})}
                          className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                            bookingData.timeSlot === slot 
                            ? 'bg-secondary border-secondary text-white shadow-lg' 
                            : 'bg-primary border-slate-700 text-gray-400 hover:border-slate-500'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                 </div>
              </div>

              <div className="mt-12 flex justify-between">
                <button onClick={prevStep} className="btn-outline">BACK</button>
                <button 
                  onClick={nextStep} 
                  disabled={!bookingData.bookingDate || !bookingData.timeSlot}
                  className="btn-primary flex items-center disabled:opacity-50"
                >
                  REVIEW <ChevronRight size={18} className="ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation & Payment */}
          {step === 4 && (
            <div className="animate-fade-in relative z-10">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <CreditCard className="mr-3 text-secondary" /> CONFIRM & PAY
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-primary/50 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-sm font-bold text-secondary uppercase mb-4 tracking-widest">Summary</h3>
                    <div className="space-y-4 text-white">
                       <div className="flex justify-between">
                         <span className="text-gray-400">Package</span>
                         <span className="text-right">{services.find(s => s._id === bookingData.service)?.name}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-400">Location</span>
                         <div className="text-right max-w-[200px] flex flex-col items-end">
                           <span className="truncate" title={bookingData.address}>{bookingData.address}</span>
                           <span className="text-[10px] text-gray-500">[{bookingData.lat.toFixed(4)}, {bookingData.lng.toFixed(4)}]</span>
                         </div>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-400">Date</span>
                         <span>{bookingData.bookingDate}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-400">Time</span>
                         <span>{bookingData.timeSlot}</span>
                       </div>
                       <div className="border-t border-slate-700 pt-4 flex justify-between font-bold text-xl">
                         <span>Total</span>
                         <span className="text-secondary">Rs. {services.find(s => s._id === bookingData.service)?.price}</span>
                       </div>
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-4 block">Payment Method</label>
                    <div className="space-y-3">
                       {['credit_card', 'paypal', 'cash'].map(method => (
                         <label key={method} className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                           bookingData.paymentMethod === method ? 'border-secondary bg-secondary/10' : 'border-slate-800 bg-primary/30'
                         }`}>
                           <input 
                            type="radio" 
                            className="hidden" 
                            name="payment"
                            checked={bookingData.paymentMethod === method}
                            onChange={() => setBookingData({...bookingData, paymentMethod: method})}
                           />
                           <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                             bookingData.paymentMethod === method ? 'border-secondary' : 'border-slate-600'
                           }`}>
                             {bookingData.paymentMethod === method && <div className="w-2.5 h-2.5 bg-secondary rounded-full"></div>}
                           </div>
                           <span className="capitalize text-white font-medium">{method.replace('_', ' ')}</span>
                         </label>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="mt-12 flex justify-between">
                <button onClick={prevStep} className="btn-outline">BACK</button>
                <button 
                  onClick={handleBooking}
                  className="btn-primary px-12 py-4 text-lg font-black tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  PAY & BOOK NOW
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;
