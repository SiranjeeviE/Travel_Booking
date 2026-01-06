
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { TravelPlan } from '../types';

const AiItinerary: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(3);
  const [budget, setBudget] = useState<'Budget' | 'Moderate' | 'Luxury'>('Moderate');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const steps = [
    "Consulting local guides...",
    "Scanning culinary hotspots...",
    "Optimizing travel logistics...",
    "Drafting your custom adventure..."
  ];

  const generatePlan = async () => {
    if (!destination) return alert("Please specify a destination");
    
    setLoading(true);
    setPlan(null);
    setLoadingStep(0);
    
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % steps.length);
    }, 2500);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Create a highly personalized ${duration}-day ${budget} travel itinerary for ${destination}. 
                   Focus on unique experiences, efficient routes, and diverse activities.`,
        config: {
          systemInstruction: `You are an elite AI Travel Concierge. 
                              Your goal is to provide perfectly balanced itineraries that include 
                              morning, afternoon, and evening activities. 
                              Ensure the output strictly follows the JSON schema provided.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              destination: { type: Type.STRING },
              duration: { type: Type.INTEGER },
              budget: { type: Type.STRING },
              itinerary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.INTEGER },
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
                        },
                        required: ['time', 'activity', 'location', 'description']
                      }
                    }
                  },
                  required: ['day', 'title', 'activities']
                }
              },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['destination', 'duration', 'budget', 'itinerary', 'recommendations']
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setPlan(result);
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("Something went wrong while generating your plan. Please try again.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          AI Itinerary Orchestrator
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Let our advanced intelligence curate your next unforgettable journey. 
          Simply specify your dream and we'll handle the logistics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm sticky top-24">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">Plan Parameters</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Where to?</label>
                <input 
                  type="text" 
                  placeholder="e.g. Kyoto, Japan"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Duration (Days)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="14"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Budget Preference</label>
                <div className="grid grid-cols-1 gap-2">
                  {(['Budget', 'Moderate', 'Luxury'] as const).map(b => (
                    <button
                      key={b}
                      onClick={() => setBudget(b)}
                      className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                        budget === b 
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={generatePlan}
                disabled={loading}
                className="w-full bg-white text-slate-950 hover:bg-indigo-50 py-4 rounded-xl font-black transition-all shadow-xl disabled:opacity-50 mt-4 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Orchestrating...
                  </span>
                ) : (
                  <>
                    <span>Generate Plan</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3">
          {!plan && !loading && (
            <div className="h-full min-h-[400px] border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-6 text-2xl">✨</div>
              <h2 className="text-xl font-bold text-slate-400 mb-2">Ready for Discovery?</h2>
              <p className="max-w-md">Enter your destination on the left to generate a comprehensive, AI-crafted itinerary in seconds.</p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center space-y-8">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold animate-pulse text-indigo-100">{steps[loadingStep]}</h3>
                <p className="text-slate-500 italic">This usually takes about 10-15 seconds</p>
              </div>
            </div>
          )}

          {plan && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Plan Header */}
              <div className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
                <div className="relative z-10">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{plan.duration} Days</span>
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{plan.budget}</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black mb-4">Adventure in {plan.destination}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    {plan.recommendations.slice(0, 4).map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 text-indigo-100 text-sm">
                        <span className="mt-1">●</span>
                        <p>{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Itinerary Timeline */}
              <div className="space-y-8">
                {plan.itinerary.map((day) => (
                  <div key={day.day} className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
                    <div className="bg-slate-800/50 px-8 py-4 border-b border-slate-800 flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Day 0{day.day}</span>
                      <h3 className="font-bold text-lg">{day.title}</h3>
                    </div>
                    <div className="p-8 space-y-8">
                      {day.activities.map((activity, idx) => (
                        <div key={idx} className="flex gap-6 relative group">
                          {idx !== day.activities.length - 1 && (
                            <div className="absolute left-3 top-8 bottom-[-2rem] w-[1px] bg-slate-800 group-hover:bg-indigo-500/30 transition-colors"></div>
                          )}
                          <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-slate-700 bg-slate-950 z-10 mt-1 group-hover:border-indigo-500 transition-colors"></div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-500 uppercase">{activity.time}</span>
                              <span className="text-xs font-bold text-indigo-400 px-2 py-0.5 bg-indigo-400/10 rounded">@ {activity.location}</span>
                            </div>
                            <h4 className="text-xl font-bold group-hover:text-indigo-300 transition-colors">{activity.activity}</h4>
                            <p className="text-slate-400 leading-relaxed text-sm italic">"{activity.description}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiItinerary;
