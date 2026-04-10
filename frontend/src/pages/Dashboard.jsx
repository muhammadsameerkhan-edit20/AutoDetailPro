import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, Car, Calendar, History, Plus, Trash2, Camera, CheckCircle, Edit } from 'lucide-react';

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  
  const fileInputRef = React.useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || ''
  });

  const [newVehicle, setNewVehicle] = useState({
    make: '', model: '', year: new Date().getFullYear(), licensePlate: '', vehicleType: 'sedan'
  });

  const [rescheduleData, setRescheduleData] = useState({
    isOpen: false, bookingId: null, date: '', timeSlot: '', availableSlots: []
  });

  useEffect(() => {
    fetchUserData();
    if (user) {
      setProfileForm({
        name: user.name || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
        const [bookRes, vehRes] = await Promise.all([
          api.get('/history'),
          api.get('/vehicles')
        ]);
      setBookings(bookRes.data.data);
      setVehicles(vehRes.data.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vehicles', newVehicle);
      setNewVehicle({ make: '', model: '', year: new Date().getFullYear(), licensePlate: '', vehicleType: 'sedan' });
      setShowAddVehicle(false);
      fetchUserData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding vehicle');
    }
  };

  const deleteVehicle = async (id) => {
    if (window.confirm('Delete this vehicle?')) {
      try {
        await api.delete(`/vehicles/${id}`);
        fetchUserData();
      } catch (err) {
        alert('Error deleting vehicle');
      }
    }
  };

  const cancelBooking = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.delete(`/bookings/${id}`);
        fetchUserData();
      } catch (err) {
        alert(err.response?.data?.message || 'Error cancelling booking');
      }
    }
  };

  const fetchAvailableSlots = async (date) => {
    try {
      const res = await api.get(`/bookings/available-slots?date=${date}`);
      setRescheduleData(prev => ({ ...prev, availableSlots: res.data.data, date, timeSlot: '' })); // reset timeslot when picking new date
    } catch (err) {
      console.error(err);
    }
  };

  const openRescheduleModal = (booking) => {
    const rawDate = new Date(booking.bookingDate).toISOString().split('T')[0];
    setRescheduleData({ isOpen: true, bookingId: booking._id, date: rawDate, timeSlot: booking.timeSlot, availableSlots: [] });
    api.get(`/bookings/available-slots?date=${rawDate}`).then(res => {
       let slots = res.data.data;
       if (!slots.includes(booking.timeSlot)) slots.push(booking.timeSlot);
       setRescheduleData(prev => ({ ...prev, availableSlots: slots.sort() }));
    });
  };

  const handleReschedule = async () => {
    try {
      await api.put(`/bookings/${rescheduleData.bookingId}/reschedule`, {
        bookingDate: rescheduleData.date,
        timeSlot: rescheduleData.timeSlot
      });
      alert('Booking intelligently rescheduled!');
      setRescheduleData({ isOpen: false, bookingId: null, date: '', timeSlot: '', availableSlots: [] });
      fetchUserData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/users/profile', profileForm);
      setUser(res.data.data); // Update AuthContext state
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await api.post('/upload', formData, config);
      
      const res = await api.put('/users/profile', {
         ...profileForm,
         profilePicture: data.url
      });
      setUser(res.data.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="h-12 w-12 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark pb-20">
      {/* Profile Header */}
      <div className="bg-primary-dark pt-32 pb-12 px-4 shadow-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
             <div className="w-32 h-32 rounded-full border-4 border-secondary overflow-hidden bg-slate-800 flex items-center justify-center relative">
                {user?.profilePicture ? (
                   <img src={`http://localhost:5001${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                   <User size={64} className="text-gray-600" />
                )}
             </div>
             <input 
               type="file" 
               accept="image/*" 
               className="hidden" 
               ref={fileInputRef} 
               onChange={handleImageUpload} 
             />
             <button 
               onClick={() => fileInputRef.current?.click()}
               disabled={uploadingImage}
               className="absolute bottom-0 right-0 p-2.5 bg-secondary rounded-full text-white shadow-xl hover:scale-110 transition-transform disabled:opacity-50 z-10"
             >
                {uploadingImage ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Camera size={16} />}
             </button>
          </div>
          <div className="flex-1">
             <h1 className="text-4xl font-black text-white uppercase tracking-tighter">{user?.name}</h1>
             <p className="text-gray-400 font-medium">{user?.email}</p>
             <div className="mt-4 flex flex-wrap gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${
                   user?.loyaltyTier === 'Diamond' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                   user?.loyaltyTier === 'Gold' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                   'bg-secondary/20 text-secondary border-secondary/30'
                }`}>
                  {user?.loyaltyTier || 'Classic'} TIER
                </span>
                <span className="px-3 py-1 bg-slate-800 text-gray-400 border border-slate-700 rounded-full text-xs font-bold uppercase">
                  {user?.loyaltyPoints || 0} POINTS EARNED
                </span>
                <span className="px-3 py-1 bg-slate-800 text-gray-400 border border-slate-700 rounded-full text-xs font-bold uppercase">
                  Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
             </div>
          </div>
          
          {/* Points Progress Visual */}
          <div className="hidden lg:block w-64 bg-primary p-6 rounded-2xl border border-slate-800 text-center">
             <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Next Tier Progress</p>
             <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                <div 
                  className="bg-secondary h-full transition-all duration-1000" 
                  style={{ width: `${Math.min((user?.loyaltyPoints || 0) / (user?.loyaltyTier === 'Classic' ? 5 : user?.loyaltyTier === 'Gold' ? 20 : 100), 100)}%` }}
                ></div>
             </div>
             <p className="text-[10px] font-bold text-gray-400">{user?.loyaltyPoints || 0} / {user?.loyaltyTier === 'Classic' ? '500' : user?.loyaltyTier === 'Gold' ? '2000' : 'MAX'} PTS</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Sidebar Navigation */}
         <div className="col-span-1 space-y-2">
            {[
              { id: 'bookings', label: 'My Bookings', icon: <Calendar size={18} /> },
              { id: 'vehicles', label: 'My Vehicles', icon: <Car size={18} /> },
              { id: 'profile', label: 'Profile Settings', icon: <User size={18} /> }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-6 py-4 rounded-xl font-bold transition-all ${
                  activeTab === item.id 
                  ? 'bg-secondary text-white shadow-lg' 
                  : 'text-gray-400 hover:bg-primary-dark hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
         </div>

         {/* Content Area */}
         <div className="col-span-1 lg:col-span-3">
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white tracking-tight">UPCOMING APPOINTMENTS</h2>
                    <button onClick={() => navigate('/booking')} className="btn-primary text-xs py-2 px-4">+ New Booking</button>
                 </div>
                 {bookings.length > 0 ? (
                   bookings.map(booking => (
                     <div key={booking._id} className="bg-primary-dark p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between gap-6 hover:border-secondary transition-all group">
                        <div className="flex items-center space-x-6">
                           <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                              <Calendar size={32} />
                           </div>
                           <div>
                              <h3 className="text-white font-bold uppercase tracking-tight">{booking.service?.name}</h3>
                              <p className="text-sm text-gray-500">{booking.vehicle?.make} {booking.vehicle?.model} • ({booking.vehicle?.licensePlate})</p>
                              <div className="mt-2 flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-xs font-bold uppercase tracking-widest">
                                 <div className="flex gap-4">
                                   <span className="text-secondary">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                                   <span className="text-gray-400">{booking.timeSlot}</span>
                                 </div>
                                 {booking.location?.address && (
                                   <span className="text-gray-500 truncate max-w-[250px] lowercase capitalize-first" title={booking.location.address}>
                                     • {booking.location.address}
                                   </span>
                                 )}
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              booking.status === 'accepted' || booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                              booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                              'bg-red-500/10 text-red-500 border border-red-500/20'
                           }`}>
                              {booking.status === 'confirmed' ? 'accepted' : booking.status}
                           </span>
                           {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                              <>
                                <button 
                                  onClick={() => openRescheduleModal(booking)} 
                                  className="text-gray-500 hover:text-blue-400 transition-colors"
                                  title="Reschedule Booking"
                                >
                                  <Edit size={18} />
                                </button>
                                <button 
                                  onClick={() => cancelBooking(booking._id)} 
                                  className="text-gray-500 hover:text-red-500 transition-colors"
                                  title="Cancel Booking"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                           )}
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="text-center py-20 bg-primary-dark rounded-2xl border border-slate-800 border-dashed">
                      <History size={48} className="mx-auto text-slate-700 mb-4" />
                      <p className="text-gray-500">No bookings yet. Ready for a shine?</p>
                   </div>
                 )}
              </div>
            )}

            {activeTab === 'vehicles' && (
              <div className="space-y-6">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white tracking-tight">YOUR GARAGE</h2>
                    <button onClick={() => setShowAddVehicle(true)} className="btn-primary text-xs py-2 px-4">+ Add Vehicle</button>
                 </div>

                 {showAddVehicle && (
                   <div className="bg-primary-dark p-8 rounded-2xl border-2 border-secondary mb-8 animate-in slide-in-from-top duration-300">
                      <form onSubmit={handleAddVehicle} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-4">
                            <input placeholder="Make (e.g. BMW)" required value={newVehicle.make} onChange={e => setNewVehicle({...newVehicle, make: e.target.value})} className="w-full" />
                            <input placeholder="Model (e.g. M4)" required value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} className="w-full" />
                            <input type="number" placeholder="Year" required value={newVehicle.year} onChange={e => setNewVehicle({...newVehicle, year: e.target.value})} className="w-full" />
                         </div>
                         <div className="space-y-4">
                            <input placeholder="License Plate" required value={newVehicle.licensePlate} onChange={e => setNewVehicle({...newVehicle, licensePlate: e.target.value})} className="w-full" />
                            <select value={newVehicle.vehicleType} onChange={e => setNewVehicle({...newVehicle, vehicleType: e.target.value})} className="w-full">
                               <option value="sedan">Sedan</option>
                               <option value="suv">SUV</option>
                               <option value="truck">Truck</option>
                               <option value="van">Van</option>
                            </select>
                            <div className="flex gap-4">
                               <button type="submit" className="flex-1 btn-primary py-3">SAVE</button>
                               <button type="button" onClick={() => setShowAddVehicle(false)} className="px-6 border border-slate-700 text-gray-400 rounded-lg">CANCEL</button>
                            </div>
                         </div>
                      </form>
                   </div>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vehicles.length > 0 ? (
                      vehicles.map(vehicle => (
                        <div key={vehicle._id} className="bg-primary-dark p-6 rounded-2xl border border-slate-800 relative group overflow-hidden">
                           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-all text-secondary">
                              <Car size={64} />
                           </div>
                           <h3 className="text-white font-black text-xl mb-1 uppercase tracking-tighter">{vehicle.make} {vehicle.model}</h3>
                           <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-4">{vehicle.year} • {vehicle.vehicleType}</p>
                           <div className="flex items-center justify-between mt-6">
                             <div className="bg-slate-800 px-3 py-1 rounded border border-slate-700 font-mono text-secondary text-sm">
                               {vehicle.licensePlate}
                             </div>
                             <button onClick={() => deleteVehicle(vehicle._id)} className="text-gray-500 hover:text-red-500 transition-colors">
                               <Trash2 size={18} />
                             </button>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-20 bg-primary-dark rounded-2xl border border-slate-800 border-dashed">
                        <Car size={48} className="mx-auto text-slate-700 mb-4" />
                        <p className="text-gray-500">Your garage is empty.</p>
                      </div>
                    )}
                 </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">PROFILE SETTINGS</h2>
                  <p className="text-gray-500 text-sm">Update your personal information and preferences.</p>
                </div>
                
                <div className="bg-primary-dark p-8 rounded-2xl border border-slate-800">
                  <form onSubmit={handleUpdateProfile} className="max-w-2xl space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Full Name</label>
                        <input 
                          value={profileForm.name} 
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} 
                          className="w-full" 
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Email Address</label>
                        <input defaultValue={user?.email} className="w-full" disabled />
                        <p className="text-[10px] text-gray-600 pl-1 italic">Email cannot be changed.</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Phone Number</label>
                        <input 
                          placeholder="+1 (555) 000-0000" 
                          value={profileForm.phoneNumber} 
                          onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} 
                          className="w-full" 
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-800 flex gap-4">
                      <button type="submit" className="btn-primary py-3 px-8 hover:scale-[1.02] active:scale-[0.98] transition-all">UPDATE PROFILE</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
         </div>
      </div>

      {/* Reschedule Modal Overlay */}
      {rescheduleData.isOpen && (
         <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-primary-dark p-8 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl">
               <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-tighter">Reschedule Appt</h2>
               
               <div className="space-y-6">
                 <div>
                   <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Choose Date</label>
                   <input 
                     type="date" 
                     min={new Date().toISOString().split('T')[0]}
                     value={rescheduleData.date} 
                     onChange={(e) => fetchAvailableSlots(e.target.value)}
                     className="w-full text-lg py-3"
                   />
                 </div>

                 <div>
                   <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Available Time Slots</label>
                   {rescheduleData.date ? (
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                       {rescheduleData.availableSlots.length > 0 ? rescheduleData.availableSlots.map(slot => (
                         <button
                           key={slot}
                           onClick={() => setRescheduleData({ ...rescheduleData, timeSlot: slot })}
                           className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                             rescheduleData.timeSlot === slot 
                             ? 'bg-secondary border-secondary text-white' 
                             : 'bg-primary border-slate-700 text-gray-400 hover:border-slate-500'
                           }`}
                         >
                           {slot}
                         </button>
                       )) : (
                         <p className="text-xs text-red-400 col-span-3">No slots available for this date.</p>
                       )}
                     </div>
                   ) : (
                     <p className="text-xs text-gray-600 italic">Select a date first.</p>
                   )}
                 </div>
               </div>

               <div className="mt-8 flex gap-4">
                  <button 
                    onClick={handleReschedule} 
                    disabled={!rescheduleData.date || !rescheduleData.timeSlot}
                    className="flex-1 btn-primary py-3 px-4 disabled:opacity-50"
                  >
                    CONFIRM
                  </button>
                  <button 
                    onClick={() => setRescheduleData({ isOpen: false, bookingId: null, date: '', timeSlot: '', availableSlots: [] })} 
                    className="px-6 border border-slate-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                  >
                    CANCEL
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default Dashboard;
