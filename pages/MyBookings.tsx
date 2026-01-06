
import React, { useState, useEffect } from 'react';
import API from '../api';

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

  if (loading) return <div className="text-center py-20">Loading your history...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
      <div className="space-y-6">
        {bookings.length > 0 ? bookings.map((booking: any) => (
          <div key={booking._id} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md mb-2 inline-block ${
                booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
              }`}>
                {booking.status}
              </span>
              <h3 className="text-2xl font-bold">{booking.room?.hotel?.name || 'Hotel Stay'}</h3>
              <p className="text-slate-500 mb-2">{booking.room?.hotel?.location}</p>
              <div className="flex gap-4 text-sm text-slate-400">
                <span>{new Date(booking.checkInDate).toLocaleDateString()} — {new Date(booking.checkOutDate).toLocaleDateString()}</span>
                <span>•</span>
                <span>{booking.room?.roomType} Room</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-indigo-400">${booking.totalPrice}</p>
              <p className="text-slate-500 text-xs uppercase font-bold">Total Paid</p>
            </div>
          </div>
        )) : (
          <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl p-20 text-center">
            <p className="text-slate-500">You haven't booked any adventures yet!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
