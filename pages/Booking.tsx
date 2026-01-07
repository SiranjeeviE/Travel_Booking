import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api.ts';

const MOCK_ROOMS = [
  { _id: 'room-1', roomType: 'Deluxe Suite', pricePerNight: 450, capacity: 2 },
  { _id: 'room-2', roomType: 'Grand Ocean View', pricePerNight: 750, capacity: 3 },
  { _id: 'room-3', roomType: 'Presidential Penthouse', pricePerNight: 2400, capacity: 4 }
];

const MOCK_HOTELS_DB = {
  'demo-1': {
    name: 'Aman Tokyo',
    location: 'Tokyo, Japan',
    description: 'A sanctuary atop the Otemachi Tower, Aman Tokyo balances urban dynamism with Japanese tradition.',
    images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200'],
    amenities: ['Spa', 'Pool', 'Fine Dining', 'City View']
  },
  'demo-2': {
    name: 'Hotel de Crillon',
    location: 'Paris, France',
    description: 'A legendary palace hotel overlooking the Place de la Concorde.',
    images: ['https://images.unsplash.com/photo-1551882547-ff43c63faf76?auto=format&fit=crop&q=80&w=1200'],
    amenities: ['Butler Service', 'Historic', 'Garden', 'Bar']
  },
  'demo-3': {
    name: 'Belmond Hotel Caruso',
    location: 'Ravello, Italy',
    description: 'An 11th-century palace set on a cliff above the Amalfi Coast.',
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200'],
    amenities: ['Infinity Pool', 'Terrace', 'Sea View', 'Gym']
  }
};

const Booking: React.FC = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayTimer = useRef<number | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await API.get(`/hotels/${hotelId}`);
        setHotel(data.data.hotel);
        setRooms(data.data.rooms);
      } catch (err) {
        console.warn("API Error, fetching from Mock DB", hotelId);
        const mockHotel = MOCK_HOTELS_DB[hotelId as keyof typeof MOCK_HOTELS_DB];
        if (mockHotel) {
          setHotel(mockHotel);
          setRooms(MOCK_ROOMS);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hotelId]);

  const hotelImages = useMemo(() => {
    if (!hotel) return [];
    return hotel.images?.length > 0 ? hotel.images : [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1551882547-ff43c63faf76?auto=format&fit=crop&q=80&w=1200'
    ];
  }, [hotel]);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % hotelImages.length);
  }, [hotelImages.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + hotelImages.length) % hotelImages.length);
  }, [hotelImages.length]);

  useEffect(() => {
    if (isAutoPlaying && !galleryOpen && hotelImages.length > 1) {
      autoPlayTimer.current = window.setInterval(nextSlide, 5000);
    }
    return () => {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
    };
  }, [isAutoPlaying, galleryOpen, nextSlide, hotelImages.length]);

  const handleDateClick = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut(null);
    } else if (date > checkIn) {
      setCheckOut(date);
      setHoverDate(null);
    } else {
      setCheckIn(date);
      setCheckOut(null);
    }
  };

  const isInRange = (date: Date) => {
    if (checkIn && checkOut) return date > checkIn && date < checkOut;
    if (checkIn && hoverDate && !checkOut && hoverDate > checkIn) return date > checkIn && date < hoverDate;
    return false;
  };

  const isSelected = (date: Date) => (
    (checkIn && date.getTime() === checkIn.getTime()) ||
    (checkOut && date.getTime() === checkOut.getTime())
  );

  const calculateDays = () => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = checkOut.getTime() - checkIn.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  }, [viewDate]);

  const handleBooking = async () => {
    const daysCount = calculateDays();
    if (!selectedRoom || daysCount <= 0 || !checkIn || !checkOut) return;

    setBookingLoading(true);
    try {
      const { data } = await API.post('/bookings', {
        room: selectedRoom._id,
        checkInDate: checkIn.toISOString(),
        checkOutDate: checkOut.toISOString()
      });
      setConfirmedBooking(data.data.booking);
      setIsBooked(true);
    } catch (err: any) {
      if (!err.response) {
        // Local Demo Persistence
        const demoBooking = {
          _id: 'demo-res-' + Math.random().toString(36).substr(2, 9),
          room: { ...selectedRoom, hotel: { name: hotel.name, location: hotel.location } },
          checkInDate: checkIn.toISOString(),
          checkOutDate: checkOut.toISOString(),
          totalPrice: daysCount * selectedRoom.pricePerNight,
          status: 'confirmed'
        };
        const existing = JSON.parse(localStorage.getItem('demo_bookings') || '[]');
        localStorage.setItem('demo_bookings', JSON.stringify([...existing, demoBooking]));
        setConfirmedBooking(demoBooking);
        setIsBooked(true);
      } else {
        alert(err.response?.data?.message || "Booking failed.");
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse">Orchestrating your suite...</p>
    </div>
  );

  if (isBooked && confirmedBooking) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in zoom-in duration-700">
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600"></div>
          <div className="p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-4xl font-black mb-2 tracking-tight">Booking Secured</h1>
            <p className="text-slate-400 text-lg mb-10">Your luxury stay at <span className="text-white font-bold">{hotel?.name}</span> is confirmed.</p>
            <div className="bg-slate-950/50 rounded-[2rem] border border-slate-800 p-8 text-left space-y-8 relative">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Reservation Reference</p>
                     <p className="font-mono text-indigo-400 text-lg font-bold bg-indigo-400/5 px-3 py-1 rounded-lg border border-indigo-400/10 inline-block">{confirmedBooking._id}</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Stay Amount</p>
                     <p className="text-4xl font-black text-white">${confirmedBooking.totalPrice}</p>
                   </div>
                 </div>
                 <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Check-In</p>
                       <p className="font-bold text-slate-200">{new Date(confirmedBooking.checkInDate).toLocaleDateString()}</p>
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Check-Out</p>
                       <p className="font-bold text-slate-200">{new Date(confirmedBooking.checkOutDate).toLocaleDateString()}</p>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/my-bookings" className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-black transition-all shadow-xl active:scale-95">View History</Link>
              <Link to="/" className="bg-slate-800 hover:bg-slate-700 text-white px-10 py-5 rounded-2xl font-black transition-all">Explore More</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const daysStay = calculateDays();
  const totalPrice = selectedRoom ? daysStay * selectedRoom.pricePerNight : 0;

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-12">
          <section>
            <Link to="/" className="text-indigo-400 text-sm font-black flex items-center gap-2 mb-8 hover:-translate-x-1 transition-transform inline-flex bg-indigo-400/5 px-4 py-2 rounded-xl border border-indigo-400/10">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Back to hotels
            </Link>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight mb-4">{hotel?.name}</h1>
            <p className="text-slate-400 text-xl font-medium flex items-center gap-2">{hotel?.location}</p>
          </section>

          <div className="relative w-full aspect-[16/9] rounded-[3rem] overflow-hidden shadow-2xl border border-slate-800 group">
            <div className="relative w-full h-full">
              {hotelImages.map((img, index) => (
                <img key={index} src={img} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`} />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {hotelImages.map((_, index) => (
                <button key={index} onClick={() => setCurrentSlide(index)} className={`h-1 rounded-full transition-all ${index === currentSlide ? 'w-8 bg-indigo-500' : 'w-2 bg-white/30'}`} />
              ))}
            </div>
          </div>

          <section className="bg-slate-900/30 p-10 rounded-[3rem] border border-slate-800/50 backdrop-blur-sm">
             <h2 className="text-3xl font-black mb-6 tracking-tight">The Experience</h2>
             <p className="text-slate-400 leading-relaxed mb-10 text-lg">{hotel?.description}</p>
             <div className="flex flex-wrap gap-3">
               {hotel?.amenities?.map((a: string, i: number) => (
                 <span key={i} className="px-5 py-2.5 bg-slate-800/40 rounded-2xl text-xs font-black text-slate-300 border border-slate-700/50 uppercase tracking-wide">{a}</span>
               ))}
             </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-3xl font-black tracking-tight">Select Your Suite</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rooms.map((room: any) => (
                <button 
                  key={room._id}
                  onClick={() => setSelectedRoom(room)}
                  className={`p-8 rounded-[2.5rem] border-2 text-left transition-all ${
                    selectedRoom?._id === room._id ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <h4 className="font-black text-2xl mb-2">{room.roomType}</h4>
                  <p className="text-slate-500 font-bold text-sm mb-8 uppercase tracking-widest">Capacity: {room.capacity} Guests</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">${room.pricePerNight}</span>
                    <span className="text-slate-500 text-xs font-black uppercase tracking-widest">/ Night</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3.5rem] sticky top-24 shadow-2xl backdrop-blur-2xl">
            <h3 className="text-3xl font-black mb-8 tracking-tight">Stay Details</h3>
            <div className="space-y-8">
              <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-6">
                <div className="text-center mb-6 font-black text-indigo-400 uppercase tracking-widest text-xs">
                  {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date, idx) => {
                    if (!date) return <div key={`empty-${idx}`} className="aspect-square"></div>;
                    const isPast = date < new Date(new Date().setHours(0,0,0,0));
                    return (
                      <button
                        key={date.getTime()}
                        disabled={isPast}
                        onClick={() => handleDateClick(date)}
                        className={`aspect-square rounded-2xl text-xs font-bold transition-all flex items-center justify-center
                          ${isPast ? 'text-slate-800' : 'hover:bg-slate-800 text-slate-400'}
                          ${isSelected(date) ? 'bg-indigo-600 text-white' : ''}
                          ${isInRange(date) ? 'bg-indigo-500/10 text-indigo-300' : ''}`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {selectedRoom && daysStay > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-6 flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Grand Total</span>
                  <span className="font-black text-white text-3xl">${totalPrice}</span>
                </div>
              )}

              <button 
                onClick={handleBooking}
                disabled={bookingLoading || !selectedRoom || daysStay <= 0}
                className="w-full bg-indigo-600 text-white hover:bg-indigo-500 py-6 rounded-3xl font-black transition-all shadow-xl disabled:opacity-20 active:scale-95 text-lg"
              >
                {bookingLoading ? 'Processing...' : 'Secure Reservation'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;