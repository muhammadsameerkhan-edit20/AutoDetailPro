import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  Users, Calendar, DollarSign, Package, TrendingUp, 
  Trash2, Edit, CheckCircle, Clock, XCircle, Search, Plus, Image as ImageIcon
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    prevMonthRevenue: 0,
    lastResetDate: null
  });
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [selectedBookings, setSelectedBookings] = useState([]);
  
  // Reschedule modal states
  const [rescheduleData, setRescheduleData] = useState({
    isOpen: false, bookingId: null, date: '', timeSlot: '', availableSlots: []
  });
  
  // Service management states
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '', description: '', price: 0, duration: 30, category: 'exterior', thumbnail: ''
  });
  const fileInputRef = React.useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, bookRes, servRes, userRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/admin/bookings'),
        api.get('/services'),
        api.get('/rbac/users')
      ]);
      setStats(statsRes.data.data);
      setBookings(bookRes.data.data);
      setServices(servRes.data.data);
      setUsers(userRes.data.data);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await api.put(`/admin/bookings/${id}/status`, { status });
      fetchAdminData();
    } catch (err) {
      alert("Error updating booking status");
    }
  };

  const trashBooking = async (id) => {
    if (window.confirm('Move this booking to trash?')) {
      try {
        await api.delete(`/bookings/${id}`);
        fetchAdminData();
      } catch (err) {
        alert("Error moving booking to trash");
      }
    }
  };

  const handleBulkTrash = async () => {
    if (window.confirm(`Move ${selectedBookings.length} bookings to trash?`)) {
      try {
        await api.put('/admin/bookings/bulk-trash', { bookingIds: selectedBookings });
        setSelectedBookings([]);
        fetchAdminData();
      } catch (err) {
        alert("Error moving bookings to trash");
      }
    }
  };

  const handleSelectAll = (e, bookingsToSelect) => {
    if (e.target.checked) {
      setSelectedBookings(bookingsToSelect.map(b => b._id));
    } else {
      setSelectedBookings([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedBookings(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
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
    // fetch initially chosen date slots so they see it
    api.get(`/bookings/available-slots?date=${rawDate}`).then(res => {
       // if their actual current shot isn't in availableSlots because it's technically taken by THEM, add it back for context
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
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule');
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.put(`/services/${editingService._id}`, serviceForm);
      } else {
        await api.post('/services', serviceForm);
      }
      setShowServiceForm(false);
      setEditingService(null);
      setServiceForm({ name: '', description: '', price: 0, duration: 30, category: 'exterior', thumbnail: '' });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving service");
    }
  };

  const deleteService = async (id) => {
    if (window.confirm('Delete this service?')) {
      try {
        await api.delete(`/services/${id}`);
        fetchAdminData();
      } catch (err) {
        alert("Error deleting service");
      }
    }
  };

  const handleServiceImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await api.post('/upload', formData, config);
      setServiceForm({ ...serviceForm, thumbnail: data.url });
    } catch (err) {
      console.error(err);
      alert('Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleResetRevenue = async () => {
    if (window.confirm('WARNING: This will reset the "Monthly Revenue" counter to zero starting from today. Are you sure?')) {
      try {
        await api.post('/analytics/reset-monthly');
        alert('Revenue counter reset successfully!');
        fetchAdminData();
      } catch (err) {
        alert('Error resetting revenue');
      }
    }
  };

  const statCards = [
    { label: 'Total Revenue', value: `Rs. ${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign className="text-green-500" />, trend: 'Lifetime' },
    { label: 'Active Bookings', value: stats.totalBookings, icon: <Calendar className="text-blue-500" />, trend: 'Active' },
    { label: 'Monthly Revenue', value: `Rs. ${stats.monthlyRevenue.toLocaleString()}`, icon: <TrendingUp className="text-secondary" />, trend: `Reset: ${stats.lastResetDate ? new Date(stats.lastResetDate).toLocaleDateString() : 'Never'}` },
    { label: 'Last Month', value: `Rs. ${stats.prevMonthRevenue.toLocaleString()}`, icon: <Clock className="text-purple-400" />, trend: 'Archived' }
  ];

  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="h-12 w-12 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin"></div>
    </div>
  );

  const activeBookings = bookings.filter(b => !b.isDeletedByAdmin);
  const trashBookings = bookings.filter(b => b.isDeletedByAdmin);

  return (
    <div className="min-h-screen bg-dark pb-20">
      <div className="bg-primary-dark pt-32 pb-8 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">ADMIN CENTRAL</h1>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Global Control Surface</p>
            </div>
            <button 
              onClick={handleResetRevenue}
              className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl border border-red-500/20 text-[10px] font-black uppercase tracking-widest transition-all mb-2"
            >
              Reset Period
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, i) => (
            <div key={i} className="bg-primary-dark p-6 rounded-2xl border border-slate-800 relative overflow-hidden group">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{card.label}</p>
                     <h3 className="text-2xl font-black text-white">{card.value}</h3>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-secondary group-hover:text-white transition-all">
                     {card.icon}
                  </div>
               </div>
               <div className="mt-4 flex items-center text-[10px] font-bold">
                  <span className="text-green-500 mr-2">{card.trend}</span>
                  <span className="text-gray-600 uppercase">vs last month</span>
               </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-8 border-b border-slate-800 mb-8 overflow-x-auto pb-1">
           {['overview', 'bookings', 'services', 'users', 'trash'].map(tab => (
             <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all relative ${
                activeTab === tab ? 'text-secondary' : 'text-gray-500 hover:text-white'
              }`}
             >
               {tab}
               {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-secondary"></div>}
             </button>
           ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
             <div className="bg-primary-dark p-8 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-4">Revenue Chart</h3>
                <div className="h-64 flex items-end justify-between px-4">
                   {[40, 60, 45, 90, 65, 80, 50, 75, 95, 60, 85, 99].map((h, i) => (
                     <div key={i} className="w-4 bg-secondary/20 hover:bg-secondary transition-all rounded-t cursor-pointer" style={{ height: `${h}%` }}></div>
                   ))}
                </div>
                <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-600 uppercase">
                  <span>Jan</span><span>Mar</span><span>Jun</span><span>Sep</span><span>Dec</span>
                </div>
             </div>

             <div className="bg-primary-dark p-8 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-4">Latest Activity</h3>
                <div className="space-y-6">
                   {activeBookings.slice(0, 5).map(b => (
                     <div key={b._id} className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-secondary">
                           <Clock size={20} />
                        </div>
                        <div className="flex-1">
                           <p className="text-xs text-white">
                              <span className="font-bold">{b.user?.name}</span> booked <span className="text-secondary">{b.service?.name}</span>
                           </p>
                           <p className="text-[10px] text-gray-600 font-bold uppercase mt-0.5">{new Date(b.createdAt).toLocaleTimeString()}</p>
                        </div>
                        <span className="text-xs text-white font-black">Rs. {b.totalAmount}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4 animate-fade-in">
             {selectedBookings.length > 0 && (
               <div className="flex items-center justify-between bg-secondary/10 border border-secondary/20 p-4 rounded-xl">
                  <span className="text-secondary text-xs font-black uppercase tracking-widest">
                    {selectedBookings.length} Bookings Selected
                  </span>
                  <button 
                    onClick={handleBulkTrash}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black py-2 px-4 rounded-lg transition-all shadow-lg"
                  >
                    <Trash2 size={14} /> MOVE TO TRASH
                  </button>
               </div>
             )}
             <div className="bg-primary-dark rounded-2xl border border-slate-800 overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                   <thead className="bg-slate-900 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                      <tr>
                         <th className="px-6 py-4 w-10">
                            <input 
                              type="checkbox" 
                              checked={selectedBookings.length === activeBookings.length && activeBookings.length > 0}
                              onChange={(e) => handleSelectAll(e, activeBookings)}
                              className="accent-secondary"
                            />
                         </th>
                         <th className="px-6 py-4">Customer</th>
                         <th className="px-6 py-4">Service</th>
                         <th className="px-6 py-4">Vehicle</th>
                         <th className="px-6 py-4">Date/Time</th>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800 text-sm">
                      {activeBookings.map(booking => (
                        <tr key={booking._id} className={`hover:bg-slate-800/30 transition-colors ${selectedBookings.includes(booking._id) ? 'bg-secondary/5' : ''}`}>
                           <td className="px-6 py-4">
                              <input 
                                type="checkbox" 
                                checked={selectedBookings.includes(booking._id)}
                                onChange={() => handleSelectOne(booking._id)}
                                className="accent-secondary"
                              />
                           </td>
                           <td className="px-6 py-4 font-bold text-white">{booking.user?.name}</td>
                           <td className="px-6 py-4 text-gray-400">{booking.service?.name}</td>
                           <td className="px-6 py-4 text-gray-400">{booking.vehicle?.make} {booking.vehicle?.model}</td>
                           <td className="px-6 py-4">
                              <div className="text-white font-medium">{new Date(booking.bookingDate).toLocaleDateString()}</div>
                              <div className="text-[10px] text-secondary font-bold font-mono mb-1">{booking.timeSlot}</div>
                              {booking.location?.address && (
                                <div className="text-[10px] text-gray-500 max-w-[150px] truncate" title={booking.location.address}>
                                  {booking.location.address}
                                </div>
                              )}
                           </td>
                           <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                booking.status === 'completed' ? 'text-blue-400 bg-blue-400/10' :
                                (booking.status === 'accepted' || booking.status === 'confirmed') ? 'text-green-500 bg-green-500/10' : 
                                booking.status === 'cancelled' ? 'text-red-500 bg-red-500/10' :
                                'text-yellow-500 bg-yellow-500/10'
                              }`}>
                                 {booking.status === 'confirmed' ? 'accepted' : booking.status}
                              </span>
                           </td>
                           <td className="px-6 py-4 flex space-x-2">
                              <button onClick={() => openRescheduleModal(booking)} title="Reschedule" className="p-1 text-gray-500 hover:text-blue-400 transition-colors"><Calendar size={16} /></button>
                              {booking.status === 'pending' && (
                                <button onClick={() => updateBookingStatus(booking._id, 'accepted')} title="Accept" className="p-1 text-gray-500 hover:text-green-500 transition-colors"><CheckCircle size={16} /></button>
                              )}
                              {(booking.status === 'accepted' || booking.status === 'confirmed') && (
                                <button onClick={() => updateBookingStatus(booking._id, 'completed')} title="Mark as Done" className="p-1 text-gray-500 hover:text-secondary transition-colors"><CheckCircle size={16} /></button>
                              )}
                              <button onClick={() => trashBooking(booking._id)} title="Delete (Trash)" className="p-1 text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">System Services</h2>
                <button 
                  onClick={() => { setShowServiceForm(true); setEditingService(null); setServiceForm({ name: '', description: '', price: 0, duration: 30, category: 'exterior' }); }}
                  className="btn-primary text-xs py-2 px-4 shadow-xl"
                >
                  <Plus size={14} className="inline mr-1 mb-0.5" /> Add Service
                </button>
             </div>

             {showServiceForm && (
                <div className="bg-primary-dark p-8 rounded-2xl border-2 border-secondary mb-8 shadow-2xl animate-in slide-in-from-top-4">
                   <form onSubmit={handleServiceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-4">
                          <input placeholder="Service Name" required value={serviceForm.name} onChange={e => setServiceForm({...serviceForm, name: e.target.value})} className="w-full" />
                          <textarea placeholder="Description" rows="3" required value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} className="w-full"></textarea>

                          <div className="border border-slate-700 bg-primary/30 p-4 rounded-xl flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                               {serviceForm.thumbnail ? (
                                  <img src={`http://localhost:5001${serviceForm.thumbnail}`} alt="Thumbnail" className="w-12 h-12 rounded object-cover border border-slate-600" />
                               ) : (
                                  <div className="w-12 h-12 rounded bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700"><ImageIcon size={20} /></div>
                               )}
                               <div className="text-xs">
                                  <p className="text-gray-400 font-bold uppercase tracking-widest mb-1">Service Thumbnail</p>
                                  <p className="text-gray-600 text-[10px]">JPG, PNG, WEBP (Max 5MB)</p>
                               </div>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleServiceImageUpload} className="hidden" accept="image/*" />
                            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} className="btn-outline py-2 px-4 shadow-xl text-xs disabled:opacity-50">
                               {uploadingImage ? 'UPLOADING...' : 'UPLOAD IMAGE'}
                            </button>
                          </div>

                       </div>
                      <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="Price (Rs.)" required value={serviceForm.price} onChange={e => setServiceForm({...serviceForm, price: e.target.value})} className="w-full" />
                            <input type="number" placeholder="Duration (min)" required value={serviceForm.duration} onChange={e => setServiceForm({...serviceForm, duration: e.target.value})} className="w-full" />
                         </div>
                         <select value={serviceForm.category} onChange={e => setServiceForm({...serviceForm, category: e.target.value})} className="w-full">
                            <option value="exterior">Exterior</option>
                            <option value="interior">Interior</option>
                            <option value="full">Full Detail</option>
                            <option value="ceramic">Ceramic Coating</option>
                         </select>
                         <div className="flex gap-4">
                            <button type="submit" className="flex-1 btn-primary py-3">SAVE SERVICE</button>
                            <button type="button" onClick={() => setShowServiceForm(false)} className="px-6 border border-slate-700 text-gray-400 rounded-lg">CANCEL</button>
                         </div>
                      </div>
                   </form>
                </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                  <div key={service._id} className="bg-primary-dark rounded-2xl border border-slate-800 relative group overflow-hidden hover:border-secondary transition-all flex flex-col">
                     {service.thumbnail ? (
                        <div className="h-40 w-full overflow-hidden border-b border-slate-800">
                           <img src={`http://localhost:5001${service.thumbnail}`} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                     ) : (
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-all text-secondary">
                           <Package size={64} />
                        </div>
                     )}

                     <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-white font-black text-xl mb-1 uppercase tracking-tighter">{service.name}</h3>
                        <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-4">{service.category} • {service.duration} min</p>
                        <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1">{service.description}</p>
                        <div className="flex items-center justify-between mt-auto">
                           <span className="text-white font-black text-2xl">Rs. {service.price}</span>
                           <div className="flex space-x-2">
                              <button onClick={() => { setEditingService(service); setServiceForm(service); setShowServiceForm(true); }} className="p-2 text-gray-500 hover:text-secondary"><Edit size={16} /></button>
                              <button onClick={() => deleteService(service._id)} className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={16} /></button>
                           </div>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
           <div className="bg-primary-dark rounded-2xl border border-slate-800 overflow-hidden overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                 <thead className="bg-slate-900 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    <tr>
                       <th className="px-6 py-4">User</th>
                       <th className="px-6 py-4">Phone Number</th>
                       <th className="px-6 py-4">Email</th>
                       <th className="px-6 py-4">Joined Date</th>
                       <th className="px-6 py-4">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800 text-sm">
                    {users.map(user => (
                      <tr key={user._id} className="hover:bg-slate-800/30 transition-colors">
                         <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                           {user.profilePicture ? <img src={`http://localhost:5001${user.profilePicture}`} className="w-6 h-6 rounded-full" /> : <div className="w-6 h-6 rounded-full bg-slate-800" />}
                           {user.name}
                         </td>
                         <td className="px-6 py-4 text-gray-400">{user.phoneNumber || 'N/A'}</td>
                         <td className="px-6 py-4 text-gray-400">{user.email}</td>
                         <td className="px-6 py-4 text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                         <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter text-blue-500 bg-blue-500/10">Active</span>
                         </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
         )}

         {/* Trash Tab (Admin Only) */}
         {activeTab === 'trash' && (
            <div className="bg-primary-dark rounded-2xl border border-slate-800 overflow-hidden overflow-x-auto animate-fade-in">
               <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-slate-900 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                     <tr>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4">Date Submited</th>
                        <th className="px-6 py-4">Status Before Trashed</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-sm">
                     {trashBookings.length > 0 ? trashBookings.map(booking => (
                       <tr key={booking._id} className="hover:bg-slate-800/30 transition-colors opacity-50">
                          <td className="px-6 py-4 font-bold text-white">{booking.user?.name}</td>
                          <td className="px-6 py-4 text-gray-400">{booking.service?.name}</td>
                          <td className="px-6 py-4 text-gray-400">{new Date(booking.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                             <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-[10px] font-black uppercase tracking-tighter">
                               {booking.status}
                             </span>
                          </td>
                       </tr>
                     )) : (
                       <tr>
                         <td colSpan="4" className="text-center py-12 text-gray-500 italic">No bookings in the trash.</td>
                       </tr>
                     )}
                  </tbody>
                </table>
            </div>
         )}
       </div>

       {/* Reschedule Modal Overlay */}
       {rescheduleData.isOpen && (
         <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-primary-dark p-8 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl">
               <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-tighter">Reschedule Booking</h2>
               
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

export default AdminDashboard;
