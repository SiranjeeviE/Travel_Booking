
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api';

const Booking: React.FC = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<any>(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  
  // Calendar State
  const [viewDate, setViewDate] = useState(new Date());
  
  // Gallery Modal State
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

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

  // Date Selection Logic
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
    if (checkIn && checkOut) {
      return date > checkIn && date < checkOut;
    }
    if (checkIn && hoverDate && !checkOut) {
      return (date > checkIn && date < hoverDate) || (date < checkIn && date > hoverDate);
    }
    return false;
  };

  const isSelected = (date: Date) => {
    return (
      (checkIn && date.getTime() === checkIn.getTime()) ||
      (checkOut && date.getTime() === checkOut.getTime())
    );
  };

  const calculateDays = () => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = checkOut.getTime() - checkIn.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  // Calendar Helpers
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Padding for start of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [viewDate]);

  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const handleBooking = async () => {
    const days = calculateDays();
    if (!selectedRoom || days <= 0 || !checkIn || !checkOut) {
      return;
    }

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
      alert(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const openGallery = (index: number) => {
    setActiveImageIndex(index);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setGalleryOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    document.body.style.overflow = 'auto';
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(1, prev + delta), 4));
    if (zoom === 1) setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex(prev => (prev + 1) % (hotel.images?.length || 1));
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex(prev => (prev - 1 + (hotel.images?.length || 1)) % (hotel.images?.length || 1));
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse">Preparing your stay...</p>
    </div>
  );

  if (isBooked && confirmedBooking) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-black mb-4">Booking Confirmed!</h1>
        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
          Your reservation at <span className="text-white font-bold">{hotel.name}</span> has been successfully processed. 
          A confirmation summary is provided below.
        </p>

        <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 mb-10 text-left space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Booking ID</p>
              <p className="font-mono text-indigo-400 font-medium select-all">{confirmedBooking._id}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Amount</p>
              <p className="text-3xl font-black text-white">${confirmedBooking.totalPrice}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Check-In</p>
              <p className="font-bold text-slate-200">{new Date(confirmedBooking.checkInDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Check-Out</p>
              <p className="font-bold text-slate-200">{new Date(confirmedBooking.checkOutDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
            </div>
          </div>

          <div className="bg-slate-950/50 rounded-2xl p-4 flex items-center gap-4 border border-slate-800/50">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Room Type</p>
              <p className="font-bold text-white">{selectedRoom?.roomType} Accommodation</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/my-bookings" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
            View My Bookings
          </Link>
          <Link to="/" className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl font-bold transition-all active:scale-95">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const days = calculateDays();
  const totalPrice = selectedRoom ? days * selectedRoom.pricePerNight : 0;
  const hotelImages = hotel.images?.length > 0 ? hotel.images : [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1551882547-ff43c63faf76?auto=format&fit=crop&q=80&w=1200'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 relative">
      {/* Gallery Modal */}
      {galleryOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 transition-opacity duration-300">
          <div className="absolute top-6 left-6 text-white z-10 animate-in fade-in slide-in-from-left-4">
            <h4 className="text-xl font-bold">{hotel.name}</h4>
            <p className="text-slate-400 text-sm">Image {activeImageIndex + 1} of {hotelImages.length}</p>
          </div>
          
          <div className="absolute top-6 right-6 flex items-center gap-4 z-10 animate-in fade-in slide-in-from-right-4">
            <div className="flex bg-slate-800/80 rounded-full p-1 border border-slate-700">
              <button onClick={() => handleZoom(0.5)} className="p-2 hover:bg-slate-700 rounded-full text-white transition-colors" title="Zoom In">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>
              </button>
              <button onClick={() => handleZoom(-0.5)} className="p-2 hover:bg-slate-700 rounded-full text-white transition-colors" title="Zoom Out">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM7 10h6" /></svg>
              </button>
            </div>
            <button onClick={closeGallery} className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white backdrop-blur-md transition-all active:scale-90">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div 
            className="w-full h-full flex items-center justify-center relative overflow-hidden cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <button onClick={prevImage} className="absolute left-4 md:left-10 z-10 bg-black/50 hover:bg-indigo-600 p-4 rounded-full text-white transition-all backdrop-blur-md border border-white/10 group active:scale-95">
              <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={nextImage} className="absolute right-4 md:right-10 z-10 bg-black/50 hover:bg-indigo-600 p-4 rounded-full text-white transition-all backdrop-blur-md border border-white/10 group active:scale-95">
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            </button>

            <div 
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              className="max-w-[90vw] max-h-[80vh] flex items-center justify-center"
            >
              <img 
                key={activeImageIndex}
                src={hotelImages[activeImageIndex]} 
                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg select-none animate-in fade-in duration-700"
                alt={`Gallery ${activeImageIndex}`}
                draggable={false}
              />
            </div>
          </div>

          <div className="absolute bottom-10 flex gap-3 p-2 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 overflow-x-auto max-w-[80vw] animate-in fade-in slide-in-from-bottom-4">
            {hotelImages.map((img: string, i: number) => (
              <button 
                key={i} 
                onClick={(e) => { e.stopPropagation(); setActiveImageIndex(i); setZoom(1); setPosition({x:0,y:0}); }}
                className={`w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-300 ${activeImageIndex === i ? 'border-indigo-500 scale-105 shadow-lg shadow-indigo-500/20' : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`Thumb ${i}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Info */}
        <div className="lg:col-span-7 space-y-10">
          <section>
            <Link to="/" className="text-indigo-400 text-sm font-bold flex items-center gap-2 mb-6 hover:translate-x-1 transition-transform inline-flex">
              ← Back to hotels
            </Link>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h1 className="text-5xl font-black tracking-tight">{hotel.name}</h1>
              <div className="bg-indigo-600/10 border border-indigo-500/20 px-4 py-2 rounded-2xl flex items-center gap-2">
                <span className="text-indigo-400 font-black">{hotel.rating}</span>
                <div className="flex text-indigo-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < Math.floor(hotel.rating) ? 'fill-current' : 'opacity-30'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-lg">{hotel.location}</p>
          </section>

          {/* Gallery Preview Layout */}
          <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[500px]">
            <div 
              onClick={() => openGallery(0)} 
              className="col-span-4 md:col-span-3 row-span-2 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800 relative group cursor-pointer"
            >
              <img 
                src={hotelImages[0]} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                alt={hotel.name}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 text-white font-bold">View in High-Res</div>
              </div>
            </div>
            <div 
              onClick={() => openGallery(1)}
              className="hidden md:block col-span-1 row-span-1 rounded-[1.5rem] overflow-hidden border border-slate-800 relative group cursor-pointer"
            >
              <img src={hotelImages[1] || hotelImages[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="View 2" />
            </div>
            <div 
              onClick={() => openGallery(2)}
              className="hidden md:block col-span-1 row-span-1 rounded-[1.5rem] overflow-hidden border border-slate-800 relative group cursor-pointer"
            >
              <img src={hotelImages[2] || hotelImages[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="View 3" />
              {hotelImages.length > 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-black text-xl">+{hotelImages.length - 3}</span>
                </div>
              )}
            </div>
          </div>

          <section className="bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800/50">
             <h2 className="text-2xl font-bold mb-4">About the Property</h2>
             <p className="text-slate-400 leading-relaxed mb-8">{hotel.description}</p>
             <div className="flex flex-wrap gap-3">
               {hotel.amenities?.map((a: string, i: number) => (
                 <span key={i} className="px-4 py-2 bg-slate-800/50 rounded-xl text-xs font-bold text-slate-300 border border-slate-700">{a}</span>
               ))}
             </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Available Accommodations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((room: any) => (
                <button 
                  key={room._id}
                  onClick={() => setSelectedRoom(room)}
                  className={`p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${
                    selectedRoom?._id === room._id 
                      ? 'border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/10' 
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  {selectedRoom?._id === room._id && (
                    <div className="absolute top-4 right-4 bg-indigo-500 text-white p-1 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </div>
                  )}
                  <h4 className="font-black text-xl mb-1">{room.roomType}</h4>
                  <p className="text-slate-500 text-sm mb-4">Fits up to {room.capacity} travelers</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">${room.pricePerNight}</span>
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">/ Night</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Checkout Sidebar */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-[3rem] sticky top-24 shadow-2xl backdrop-blur-xl">
            <h3 className="text-2xl font-black mb-6 tracking-tight">Complete Reservation</h3>
            
            <div className="space-y-6 mb-8">
              {/* Sophisticated Date Range Picker */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-4">
                    <div className={`text-center transition-opacity ${checkIn ? 'opacity-100' : 'opacity-40'}`}>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Check-In</p>
                      <p className="text-sm font-bold text-white">{checkIn ? checkIn.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'Set Date'}</p>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-800 mt-2"></div>
                    <div className={`text-center transition-opacity ${checkOut ? 'opacity-100' : 'opacity-40'}`}>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Check-Out</p>
                      <p className="text-sm font-bold text-white">{checkOut ? checkOut.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'Set Date'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button 
                      onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 overflow-hidden">
                  <div className="text-center mb-5">
                    <span className="text-sm font-black text-indigo-400 uppercase tracking-[0.2em]">{monthName}</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <span key={i} className="text-[9px] font-black text-slate-600">{d}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1" onMouseLeave={() => setHoverDate(null)}>
                    {calendarDays.map((date, idx) => {
                      if (!date) return <div key={`empty-${idx}`} className="aspect-square"></div>;
                      
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const isPast = date < today;
                      const active = isSelected(date);
                      const inRange = isInRange(date);
                      const isCheckIn = checkIn && date.getTime() === checkIn.getTime();
                      const isCheckOut = checkOut && date.getTime() === checkOut.getTime();
                      const isHovered = hoverDate && date.getTime() === hoverDate.getTime();
                      
                      return (
                        <button
                          key={date.getTime()}
                          disabled={isPast}
                          onClick={() => handleDateClick(date)}
                          onMouseEnter={() => !isPast && setHoverDate(date)}
                          className={`
                            aspect-square rounded-xl text-xs font-bold transition-all relative group/day
                            ${isPast ? 'text-slate-800 cursor-not-allowed' : 'hover:scale-105'}
                            ${active ? 'bg-indigo-600 text-white z-10 shadow-lg shadow-indigo-600/30' : 'text-slate-300'}
                            ${inRange ? 'bg-indigo-500/10 text-indigo-300' : ''}
                            ${!active && !inRange && !isPast ? 'hover:bg-slate-800' : ''}
                            ${isCheckIn && !checkOut ? 'rounded-r-none' : ''}
                            ${isCheckOut ? 'rounded-l-none' : ''}
                          `}
                        >
                          <span className="relative z-10">{date.getDate()}</span>
                          {date.getTime() === today.getTime() && (
                            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-indigo-500 rounded-full"></div>
                          )}
                          {/* Visual range highlight helper */}
                          {inRange && (
                            <div className="absolute inset-0 bg-indigo-500/5 -z-0"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {selectedRoom && (
                <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Selected Tier</span>
                    <span className="font-bold text-white">{selectedRoom.roomType}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Daily Rate</span>
                    <span className="font-bold text-white">${selectedRoom.pricePerNight}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Duration</span>
                    <span className="font-bold text-indigo-400">{days} {days === 1 ? 'Night' : 'Nights'}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Stay Cost</p>
                      <p className="text-4xl font-black text-white">${totalPrice}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={handleBooking}
              disabled={bookingLoading || !selectedRoom || days <= 0}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-500 py-5 rounded-2xl font-black transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 text-lg"
            >
              {bookingLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Confirm Booking'}
            </button>
            
            <div className="mt-8 pt-8 border-t border-slate-800 text-center">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure Payment • Pay At Hotel
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
