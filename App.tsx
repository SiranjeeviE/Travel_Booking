import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Destination, TravelPlan } from './types';

// Utility for decoding base64 audio from TTS
const decodeBase64 = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [groundingLinks, setGroundingLinks] = useState<{ uri: string; title: string }[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<TravelPlan | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    setLoading(true);
    setDestinations([]);
    setGroundingLinks([]);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `I want to travel based on this: "${searchQuery}". Suggest 3 specific real-world destinations with detailed descriptions and pricing.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                country: { type: Type.STRING },
                description: { type: Type.STRING },
                rating: { type: Type.NUMBER },
                pricePerNight: { type: Type.NUMBER },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "country", "description", "pricePerNight"]
            }
          }
        },
      });

      // Handle search grounding
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const links = chunks.map((c: any) => c.web).filter(Boolean);
        setGroundingLinks(links);
      }

      const results = JSON.parse(response.text || '[]');
      setDestinations(results.map((d: any, i: number) => ({
        ...d,
        id: d.id || `dest-${i}`,
        rating: d.rating || 4.8,
        imageUrl: `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200`
      })));
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateItinerary = async (dest: Destination) => {
    setLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Create a professional 3-day travel itinerary for ${dest.name}, ${dest.country}. Include unique local experiences and dining.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              destination: { type: Type.STRING },
              duration: { type: Type.NUMBER },
              budget: { type: Type.STRING },
              itinerary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.NUMBER },
                    title: { type: Type.STRING },
                    activities: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          time: { type: Type.STRING },
                          activity: { type: Type.STRING },
                          location: { type: Type.STRING },
                          description: { type: Type.STRING }
                        }
                      }
                    }
                  }
                }
              },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });

      setSelectedPlan(JSON.parse(response.text || '{}'));
    } catch (error) {
      console.error("Itinerary generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const playAudioTour = async (text: string) => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Read this travel preview in an engaging, professional narrator voice: ${text}` }] }],
        config: {
          responseModalities: ["AUDIO" as any],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
          }
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPlayingAudio(false);
        source.start();
      }
    } catch (error) {
      console.error("TTS failed:", error);
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-2xl tracking-tight hidden sm:block">Explore Ease</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Plan Trip</button>
            <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Destinations</button>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 active:scale-95">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Search Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Discover Your Next <span className="text-indigo-500">Masterpiece.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
            Intelligent travel planning powered by the world's most capable AI. Find, plan, and book your dream escape in seconds.
          </p>

          <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Where do you want to explore? (e.g. 'Cultural weekend in Rome')"
              className="w-full bg-slate-900 border border-slate-800 rounded-3xl py-5 px-14 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-xl shadow-2xl"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 top-2.5 bottom-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 rounded-2xl font-bold transition-all"
            >
              {loading ? 'Searching...' : 'Explore'}
            </button>
          </form>

          {groundingLinks.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-4 animate-fade-in">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pt-1">Verified Sources:</span>
              {groundingLinks.map((link, idx) => (
                <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1">
                  {link.title} <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest) => (
            <div key={dest.id} className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all shadow-xl flex flex-col">
              <div className="aspect-[16/9] relative overflow-hidden bg-slate-800">
                <img src={dest.imageUrl} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-60" />
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  ${dest.pricePerNight} <span className="text-slate-400 font-normal">/ night</span>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold group-hover:text-indigo-400 transition-colors">{dest.name}</h3>
                    <p className="text-slate-500 font-medium">{dest.country}</p>
                  </div>
                  <div className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-lg flex items-center gap-1 font-bold text-sm">
                    {dest.rating} <span className="text-indigo-500">★</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3 italic">"{dest.description}"</p>
                <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                  {dest.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] uppercase font-black tracking-tighter text-slate-500 border border-slate-800 px-2 py-1 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={() => generateItinerary(dest)}
                  className="w-full py-4 bg-white text-slate-950 hover:bg-indigo-50 rounded-2xl font-bold transition-all shadow-lg active:scale-95"
                >
                  Generate Plan
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Itinerary Modal */}
        {selectedPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setSelectedPlan(null)} />
            <div className="relative bg-slate-900 border border-slate-800 w-full max-w-5xl max-h-[90vh] rounded-[40px] shadow-3xl overflow-hidden flex flex-col">
              <div className="p-8 sm:p-12 border-b border-slate-800 bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                  <h2 className="text-4xl font-black mb-2 tracking-tighter">{selectedPlan.destination}</h2>
                  <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                    <span className="bg-slate-800 px-3 py-1 rounded-full">{selectedPlan.duration} Days</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span className="bg-slate-800 px-3 py-1 rounded-full">{selectedPlan.budget} Experience</span>
                  </div>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                  <button 
                    onClick={() => playAudioTour(`Welcome to ${selectedPlan.destination}. Your journey begins today.`)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold transition-all ${isPlayingAudio ? 'animate-pulse' : ''}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                    {isPlayingAudio ? 'Speaking...' : 'Audio Preview'}
                  </button>
                  <button onClick={() => setSelectedPlan(null)} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-16">
                {selectedPlan.itinerary.map((day) => (
                  <div key={day.day} className="grid grid-cols-1 lg:grid-cols-4 gap-8 border-t border-slate-800 pt-12 first:border-0 first:pt-0">
                    <div className="lg:col-span-1">
                      <div className="sticky top-0">
                        <span className="text-indigo-500 font-black text-6xl opacity-20 select-none">0{day.day}</span>
                        <h3 className="text-2xl font-bold mt-[-30px]">{day.title}</h3>
                      </div>
                    </div>
                    <div className="lg:col-span-3 space-y-10">
                      {day.activities.map((act, idx) => (
                        <div key={idx} className="group flex gap-6 relative">
                          <div className="flex-none flex flex-col items-center">
                            <div className="w-4 h-4 rounded-full bg-indigo-600 border-4 border-slate-900 z-10" />
                            <div className="w-0.5 h-full bg-slate-800 -mt-1 group-last:bg-transparent" />
                          </div>
                          <div className="pb-4">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-mono text-indigo-400 text-xs font-bold tracking-widest">{act.time}</span>
                              <h4 className="font-bold text-xl">{act.activity}</h4>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-3">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {act.location}
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">{act.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <p className="text-xs text-slate-500 max-w-sm hidden sm:block">This itinerary was bespoke-crafted for your preferences using real-time destination data.</p>
                <button className="w-full sm:w-auto px-12 py-4 bg-white text-slate-950 hover:bg-indigo-50 rounded-2xl font-black shadow-xl transition-all transform hover:-translate-y-1">
                  Book Complete Package
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 py-20 bg-slate-900/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
              <span className="font-bold text-sm">E</span>
            </div>
            <span className="font-bold tracking-tighter">Explore Ease</span>
          </div>
          <p className="text-slate-500 text-sm mb-12 italic">"The world is a book, and those who do not travel read only one page."</p>
          <div className="flex flex-wrap justify-center gap-12 text-slate-600 text-xs font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-400 transition-colors">Destinations</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">AI Engine</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;