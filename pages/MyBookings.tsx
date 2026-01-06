
import React, { useState, useEffect } from 'react';
// Import Link to resolve navigation errors
import { Link } from 'react-router-dom';
import API from '../api.ts';

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await API.get('/bookings/my-bookings');
        setBookings(data.data.bookings);
      } catch (err) {
        console.error("Failed to fetch my bookings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium">Loading your history...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl font-black mb-10 tracking-tight">My Reservations</h1>
      <div className="space-y-6">
        {bookings.length > 0 ? bookings.map((booking: any) => (
          <div key={booking._id} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-slate-700 transition-colors shadow-xl">
            <div className="space-y-3">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              }`}>
                {booking.status}
              </span>
              <h3 className="text-2xl font-bold tracking-tight">{booking.room?.hotel?.name || 'Hotel Stay'}</h3>
              <p className="text-slate-500 font-medium">{booking.room?.hotel?.location}</p>
              <div className="flex gap-4 text-sm text-slate-400 font-medium">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  {new Date(booking.checkInDate).toLocaleDateString()} — {new Date(booking.checkOutDate).toLocaleDateString()}
                </span>
                <span className="text-slate-800">•</span>
                <span>{booking.room?.roomType} Room</span>
              </div>
            </div>
            <div className="text-right md:bg-slate-950/50 p-6 rounded-2xl md:border md:border-slate-800/50 min-w-[140px]">
              <p className="text-3xl font-black text-indigo-400">${booking.totalPrice}</p>
              <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-1">Total Stay</p>
            </div>
          </div>
        )) : (
          <div className="bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[3rem] p-24 text-center">
             <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
             </div>
            <p className="text-slate-500 font-medium text-lg">You haven't booked any adventures yet!</p>
            {/* Added Link component to navigate users back to the homepage */}
            <Link to="/" className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
              Discover Stays
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
