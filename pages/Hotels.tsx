
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

const Hotels: React.FC = () => {
  const [hotels, setHotels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredHotels = hotels.filter((hotel: any) => 
    hotel.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">Discover Exceptional Stays</h1>
          <p className="text-slate-400">Hand-picked properties for your next luxury escape.</p>
        </div>
        <div className="relative group w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search by city or property name..."
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all backdrop-blur-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-slate-900 border border-slate-800 rounded-3xl h-[450px]"></div>
          ))}
        </div>
      ) : (
        <>
          {filteredHotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredHotels.map((hotel: any) => (
                <div key={hotel._id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all group shadow-xl">
                  <div className="aspect-[4/3] bg-slate-800 relative overflow-hidden">
                    <img 
                      src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800'} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      alt={hotel.name}
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 text-white">
                        {hotel.location.split(',')[0]}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-indigo-600 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1 shadow-lg">
                      {hotel.rating} ★
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-1 group-hover:text-indigo-400 transition-colors">{hotel.name}</h3>
                    <p className="text-slate-500 text-sm mb-4 font-medium">{hotel.location}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {hotel.amenities?.slice(0, 3).map((amenity: string, i: number) => (
                        <span key={i} className="bg-slate-800/50 text-slate-400 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-700">
                          {amenity}
                        </span>
                      ))}
                    </div>
                    <Link 
                      to={`/booking/${hotel._id}`}
                      className="block w-full text-center bg-white text-slate-950 hover:bg-indigo-50 py-4 rounded-2xl font-black transition-all shadow-lg active:scale-[0.98]"
                    >
                      Explore Property
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-40 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[3rem]">
              <div className="text-5xl mb-4">📍</div>
              <h3 className="text-xl font-bold text-slate-400">No properties found</h3>
              <p className="text-slate-500">Try searching for a different city or location.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Hotels;
