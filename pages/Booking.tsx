
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

const Booking: React.FC = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<any>(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await API.get(`/hotels/${hotelId}`);
        setHotel(data.data.hotel);
        setRooms(data.data.rooms);
      } catch (err) {
        console.error("Failed to fetch hotel detail", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hotelId]);

  const handleBooking = async () => {
    if (!selectedRoom || !checkIn || !checkOut) {
      alert("Please select a room and dates");
      return;
    }

    setBookingLoading(true);
    try {
      await API.post('/bookings', {
        room: selectedRoom._id,
        checkInDate: checkIn,
        checkOutDate: checkOut
      });
      alert("Booking successful!");
      navigate('/my-bookings');
    } catch (err: any) {
      alert(err.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading hotel...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">{hotel.name}</h1>
          <p className="text-slate-500 text-lg">{hotel.location}</p>
        </div>

        <div className="aspect-video bg-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <img src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200'} className="w-full h-full object-cover" />
        </div>

        <section>
          <h2 className="text-2xl font-bold mb-6">Select a Room</h2>
          <div className="space-y-4">
            {rooms.length > 0 ? rooms.map((room: any) => (
              <div 
                key={room._id}
                onClick={() => setSelectedRoom(room)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                  selectedRoom?._id === room._id 
                    ? 'border-indigo-500 bg-indigo-500/5' 
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                <div>
                  <h4 className="font-bold text-lg">{room.roomType} Room</h4>
                  <p className="text-slate-500 text-sm">Capacity: {room.capacity} Persons</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">${room.pricePerNight}</p>
                  <p className="text-slate-500 text-xs">per night</p>
                </div>
              </div>
            )) : (
              <p className="text-slate-500 italic">No rooms available currently.</p>
            )}
          </div>
        </section>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl sticky top-24 shadow-2xl">
          <h3 className="text-xl font-bold mb-8">Reservation Details</h3>
          
          <div className="space-y-6 mb-10">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Check In</label>
              <input 
                type="date" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Check Out</label>
              <input 
                type="date" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>

          {selectedRoom && checkIn && checkOut && (
            <div className="border-t border-slate-800 pt-6 mb-8 flex justify-between items-end">
              <div>
                <p className="text-slate-500 text-xs uppercase font-bold mb-1">Total Price</p>
                <p className="text-3xl font-bold text-indigo-400">
                  ${Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) * selectedRoom.pricePerNight}
                </p>
              </div>
            </div>
          )}

          <button 
            onClick={handleBooking}
            disabled={bookingLoading}
            className="w-full bg-white text-slate-950 hover:bg-indigo-50 py-4 rounded-xl font-black transition-all shadow-xl disabled:opacity-50"
          >
            {bookingLoading ? 'Confirming...' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Booking;
