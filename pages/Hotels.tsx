
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

const Hotels: React.FC = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const { data } = await API.get('/hotels');
        setHotels(data.data.hotels);
      } catch (err) {
        console.error("Failed to fetch hotels", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500">Loading amazing stays...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Discover Stays</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hotels.map((hotel: any) => (
          <div key={hotel._id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all group">
            <div className="aspect-video bg-slate-800 relative overflow-hidden">
               <img 
                 src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800'} 
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
               />
               <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
                 {hotel.rating} ★
               </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">{hotel.name}</h3>
              <p className="text-slate-500 text-sm mb-4">{hotel.location}</p>
              <p className="text-slate-400 text-sm line-clamp-2 mb-6 italic">"{hotel.description}"</p>
              <Link 
                to={`/booking/${hotel._id}`}
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
              >
                View Rooms
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hotels;
