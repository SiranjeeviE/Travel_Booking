
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
    if (checkIn && hoverDate && !checkOut && hoverDate > checkIn) {
      return date > checkIn && date < hoverDate;
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
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
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
      <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in zoom-in duration-700">
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600"></div>
          
          <div className="p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.15)] border border-green-500/20">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-black mb-2 tracking-tight">Booking Confirmed!</h1>
            <p className="text-slate-400 text-lg mb-10">Your adventure begins at <span className="text-white font-bold">{hotel.name}</span>.</p>

            <div className="bg-slate-950/50 rounded-[2rem] border border-slate-800 p-8 text-left space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none">
                 <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                 <div className="space-y-6">
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Reservation Reference</p>
                     <p className="font-mono text-indigo-400 text-lg font-bold bg-indigo-400/5 px-3 py-1 rounded-lg border border-indigo-400/10 inline-block">
                       {confirmedBooking._id}
                     </p>
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Stay Amount</p>
                     <p className="text-4xl font-black text-white">${confirmedBooking.totalPrice}</p>
                     <p className="text-xs text-slate-500 mt-1 font-medium italic">Confirmed & Paid in Full</p>
                   </div>
                 </div>

                 <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Check-In</p>
                       <p className="font-bold text-slate-200">{new Date(confirmedBooking.checkInDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Check-Out</p>
                       <p className="font-bold text-slate-200">{new Date(confirmedBooking.checkOutDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                     </div>
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Accommodation Tier</p>
                     <div className="flex items-center gap-2">
                       <span className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
                       <p className="font-bold text-white uppercase text-sm tracking-wide">{selectedRoom?.roomType || 'Standard'}</p>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="pt-8 border-t border-slate-800/50 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                 <div className="flex items-center gap-1.5">
                   <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                   <span>Confirmation sent to email</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                   <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                   <span>Secure Transaction</span>
                 </div>
               </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/my-bookings" className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-black transition-all shadow-xl shadow-indigo-600/20 active:scale-95 group">
                <span className="flex items-center gap-2">
                  View My History
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </span>
              </Link>
              <Link to="/" className="bg-slate-800 hover:bg-slate-700 text-white px-10 py-5 rounded-2xl font-black transition-all active:scale-95">
                Explore More
              </Link>
            </div>
          </div>
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
            <div className="flex bg-slate-800/80 rounded-full p-1 border border-slate-700 shadow-xl">
              <button onClick={() => handleZoom(0.5)} className="p-2 hover:bg-slate-700 rounded-full text-white transition-colors" title="Zoom In">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>
              </button>
              <button onClick={() => handleZoom(-0.5)} className="p-2 hover:bg-slate-700 rounded-full text-white transition-colors" title="Zoom Out">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM7 10h6" /></svg>
              </button>
            </div>
            <button onClick={closeGallery} className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white backdrop-blur-md transition-all active:scale-90 border border-white/10">
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
            <button onClick={prevImage} className="absolute left-4 md:left-10 z-10 bg-black/50 hover:bg-indigo-600 p-4 rounded-full text-white transition-all backdrop-blur-md border border-white/10 group active:scale-95 shadow-2xl">
              <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={nextImage} className="absolute right-4 md:right-10 z-10 bg-black/50 hover:bg-indigo-600 p-4 rounded-full text-white transition-all backdrop-blur-md border border-white/10 group active:scale-95 shadow-2xl">
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
                className="max-w-full max-h-full object-contain shadow-[0_0_80px_rgba(0,0,0,0.5)] rounded-2xl select-none animate-in fade-in duration-700"
                alt={`Gallery ${activeImageIndex}`}
                draggable={false}
              />
            </div>
          </div>

          <div className="absolute bottom-10 flex gap-3 p-2 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 overflow-x-auto max-w-[80vw] animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
            {hotelImages.map((img: string, i: number) => (
              <button 
                key={i} 
                onClick={(e) => { e.stopPropagation(); setActiveImageIndex(i); setZoom(1); setPosition({x:0,y:0}); }}
                className={`w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-300 ${activeImageIndex === i ? 'border-indigo-500 scale-105 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`Thumb ${i}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Info */}
        <div className="lg:col-span-7 space-y-12">
          <section>
            <Link to="/" className="text-indigo-400 text-sm font-black flex items-center gap-2 mb-8 hover:-translate-x-1 transition-transform inline-flex bg-indigo-400/5 px-4 py-2 rounded-xl border border-indigo-400/10">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Back to hotels
            </Link>
            <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
              <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">{hotel.name}</h1>
              <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl">
                <span className="text-indigo-400 font-black text-xl">{hotel.rating}</span>
                <div className="flex text-indigo-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < Math.floor(hotel.rating) ? 'fill-current' : 'opacity-20'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-xl font-medium flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              {hotel.location}
            </p>
          </section>

          {/* Gallery Preview Layout */}
          <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[550px]">
            <div 
              onClick={() => openGallery(0)} 
              className="col-span-4 md:col-span-3 row-span-2 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-800 relative group cursor-pointer"
            >
              <img 
                src={hotelImages[0]} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                alt={hotel.name}
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <div className="bg-white/10 backdrop-blur-xl px-8 py-4 rounded-2xl border border-white/20 text-white font-black text-sm uppercase tracking-widest shadow-2xl scale-95 group-hover:scale-100 transition-transform">
                  View Full Gallery
                </div>
              </div>
            </div>
            <div 
              onClick={() => openGallery(1)}
              className="hidden md:block col-span-1 row-span-1 rounded-[2rem] overflow-hidden border border-slate-800 relative group cursor-pointer"
            >
              <img src={hotelImages[1] || hotelImages[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="View 2" />
            </div>
            <div 
              onClick={() => openGallery(2)}
              className="hidden md:block col-span-1 row-span-1 rounded-[2rem] overflow-hidden border border-slate-800 relative group cursor-pointer"
            >
              <img src={hotelImages[2] || hotelImages[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="View 3" />
              {hotelImages.length > 3 && (
                <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-black text-3xl">+{hotelImages.length - 3}</span>
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Photos</span>
                </div>
              )}
            </div>
          </div>

          <section className="bg-slate-900/30 p-10 rounded-[3rem] border border-slate-800/50 backdrop-blur-sm">
             <h2 className="text-3xl font-black mb-6 tracking-tight">The Experience</h2>
             <p className="text-slate-400 leading-relaxed mb-10 text-lg font-medium">{hotel.description}</p>
             <div className="flex flex-wrap gap-3">
               {hotel.amenities?.map((a: string, i: number) => (
                 <span key={i} className="px-5 py-2.5 bg-slate-800/40 rounded-2xl text-xs font-black text-slate-300 border border-slate-700/50 uppercase tracking-wide">
                   {a}
                 </span>
               ))}
             </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-3xl font-black tracking-tight">Select Your Accommodation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rooms.map((room: any) => (
                <button 
                  key={room._id}
                  onClick={() => setSelectedRoom(room)}
                  className={`p-8 rounded-[2.5rem] border-2 text-left transition-all relative overflow-hidden group ${
                    selectedRoom?._id === room._id 
                      ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_40px_rgba(99,102,241,0.1)]' 
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80 shadow-xl'
                  }`}
                >
                  <div className={`absolute top-6 right-6 p-2 rounded-xl transition-all ${selectedRoom?._id === room._id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  <h4 className="font-black text-2xl mb-2 tracking-tight">{room.roomType} Suite</h4>
                  <p className="text-slate-500 font-bold text-sm mb-8 uppercase tracking-widest">Occupancy: {room.capacity} Guests</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">${room.pricePerNight}</span>
                    <span className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">/ Per Night</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Reservation Sidebar */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-[3.5rem] sticky top-24 shadow-[0_40px_100px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
            <div className="mb-10">
              <h3 className="text-3xl font-black mb-2 tracking-tight">Stay Orchestration</h3>
              <p className="text-slate-500 text-sm font-medium">Define your dates and secure your escape.</p>
            </div>
            
            <div className="space-y-8 mb-10">
              {/* Custom Sophisticated Date Range Picker */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <div className={`transition-all duration-300 ${checkIn ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Check-In</p>
                      <p className="text-base font-black text-white">{checkIn ? checkIn.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'Pending'}</p>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-800 mt-2 self-center"></div>
                    <div className={`transition-all duration-300 ${checkOut ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Check-Out</p>
                      <p className="text-base font-black text-white">{checkOut ? checkOut.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'Pending'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 transition-all active:scale-90"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button 
                      onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 transition-all active:scale-90"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-6 overflow-hidden shadow-inner">
                  <div className="text-center mb-6">
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">{monthName}</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center mb-3">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <span key={i} className="text-[10px] font-black text-slate-600">{d}</span>
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
                      
                      return (
                        <button
                          key={date.getTime()}
                          disabled={isPast}
                          onClick={() => handleDateClick(date)}
                          onMouseEnter={() => !isPast && setHoverDate(date)}
                          className={`
                            aspect-square rounded-2xl text-xs font-bold transition-all relative flex items-center justify-center
                            ${isPast ? 'text-slate-800 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}
                            ${active ? 'bg-indigo-600 text-white z-10 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'text-slate-400'}
                            ${inRange ? 'bg-indigo-500/10 text-indigo-300' : ''}
                            ${!active && !inRange && !isPast ? 'hover:bg-slate-800' : ''}
                            ${isCheckIn && !checkOut ? 'rounded-r-none' : ''}
                            ${isCheckOut ? 'rounded-l-none' : ''}
                          `}
                        >
                          <span className="relative z-10">{date.getDate()}</span>
                          {date.getTime() === today.getTime() && !active && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500/50 rounded-full"></div>
                          )}
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
                <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Tier Selected</span>
                    <span className="font-black text-white uppercase">{selectedRoom.roomType}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Stay Duration</span>
                    <span className="font-black text-indigo-400">{days || 0} {days === 1 ? 'Night' : 'Nights'}</span>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-800">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Estimated Total</p>
                        <p className="text-5xl font-black text-white">${totalPrice}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={handleBooking}
              disabled={bookingLoading || !selectedRoom || days <= 0}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-500 py-6 rounded-3xl font-black transition-all shadow-[0_20px_50px_rgba(99,102,241,0.3)] disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 text-lg relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {bookingLoading ? (
                  <>
                    <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Complete Reservation'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
            
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Premium Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
