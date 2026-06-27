import React, { useState } from 'react';
import { HazardType, SeverityLevel, HazardReport } from '../types';
import { HAZARD_CONFIG, SEVERITY_CONFIG } from '../utils/hazardConfig';
import { analyzeHazardPhoto, generateSmartDescription } from '../services/geminiService';
import { Camera, MapPin, CheckCircle, AlertTriangle, Cpu, HelpCircle, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';

interface ReportFormProps {
  onAddReport: (report: Omit<HazardReport, 'id' | 'createdAt' | 'comments' | 'reporterName' | 'reporterRole' | 'reporterReputation' | 'upvotes' | 'downvotes' | 'status'> & { photoData?: string }) => void;
  onCancel: () => void;
  selectedCoords: { lat: number; lng: number } | null;
}

// Compact, real-world low-resolution base64 string mockups to send to the backend,
// representing simulated images. These are valid light-weight base64 images that trigger
// clean, real requests to our Express server.
const MOCK_PHOTOS = {
  pothole: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', // 1x1 gray pixel
  flood: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  construction: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
};

export default function ReportForm({ onAddReport, onCancel, selectedCoords }: ReportFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [hazardType, setHazardType] = useState<HazardType>('pothole');
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [isBlockingTraffic, setIsBlockingTraffic] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  // Gemini State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEnhancingDesc, setIsEnhancingDesc] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  // Location Autocenter Check
  const latStr = selectedCoords ? selectedCoords.lat.toFixed(5) : 'Click Map to set Pin';
  const lngStr = selectedCoords ? selectedCoords.lng.toFixed(5) : 'Click Map to set Pin';

  const handleDemoPhotoSelect = async (type: 'pothole' | 'flood' | 'construction') => {
    setIsAnalyzing(true);
    setPhoto(MOCK_PHOTOS[type]);

    try {
      const result = await analyzeHazardPhoto(MOCK_PHOTOS[type]);
      setAiAnalysisResult(result);
      
      // Auto-set form values based on AI's vision!
      setHazardType(result.hazardType);
      setSeverity(result.severity);
      setDescription(result.description);
      
      // Auto-fill location suggestion if empty
      if (!locationName) {
        if (type === 'pothole') setLocationName('Boundary Road, East Legon');
        else if (type === 'flood') setLocationName('Alajo Underpass, Accra Central');
        else setLocationName('Ring Road Central Construction Spot');
      }

      setStep(2); // Jump to refine step directly after AI performs work
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setPhoto(base64String);
      
      setIsAnalyzing(true);
      try {
        const result = await analyzeHazardPhoto(base64String);
        setAiAnalysisResult(result);
        setHazardType(result.hazardType);
        setSeverity(result.severity);
        setDescription(result.description);
        setStep(2);
      } catch (err) {
        console.error(err);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEnhanceDescription = async () => {
    if (!description || description.length < 5) return;
    setIsEnhancingDesc(true);
    try {
      const enhanced = await generateSmartDescription(hazardType, severity, description);
      setDescription(enhanced);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancingDesc(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoords) return;
    if (!locationName) return;

    onAddReport({
      type: hazardType,
      severity,
      latitude: selectedCoords.lat,
      longitude: selectedCoords.lng,
      locationName,
      description,
      isBlockingTraffic,
      photoUrl: photo || undefined,
      aiAnalyzed: !!aiAnalysisResult,
      aiAnalysisResult: aiAnalysisResult || undefined
    });
  };

  return (
    <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 shadow-2xl h-full flex flex-col justify-between" id="report-form-panel">
      
      {/* Header with Title and Step Indicators */}
      <div>
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-brand-gold font-bold">COMMUNITY REPORTING PORTAL</p>
            <h2 className="font-display font-black text-xl text-white flex items-center gap-2 mt-0.5">
              Report Road Hazard
            </h2>
          </div>
          <div className="flex gap-1.5">
            <span className={`w-6 h-1.5 rounded-full ${step >= 1 ? 'bg-brand-gold' : 'bg-zinc-800'}`} />
            <span className={`w-6 h-1.5 rounded-full ${step >= 2 ? 'bg-brand-gold' : 'bg-zinc-800'}`} />
            <span className={`w-6 h-1.5 rounded-full ${step >= 3 ? 'bg-brand-gold' : 'bg-zinc-800'}`} />
          </div>
        </div>

        {/* STEP 1: Set Location Pin */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-zinc-950 border border-white/5 rounded-2xl p-4 flex gap-4 items-center">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold border border-brand-gold/20 flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] font-black tracking-widest text-brand-gold uppercase">Spot Coordinates</div>
                <div className="text-xs font-bold font-mono text-slate-200 mt-1 truncate">
                  Lat: <span className="text-brand-gold">{latStr}</span> | Lng: <span className="text-brand-gold">{lngStr}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  {selectedCoords ? '🎯 Location selected. Double click elsewhere on the map to modify.' : '👈 Double click a point directly on the main map to set coordinates.'}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Spot Name / Near Landmarks</label>
              <input
                type="text"
                placeholder="e.g. Boundary Road near GNPC station, Legon"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-brand-gold"
                required
              />
            </div>

            <div className="pt-4 border-t border-white/5">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-gold" />
                Gemini Vision Assist — Quick Report
              </h3>
              <p className="text-[11px] text-slate-400 mb-3.5 leading-relaxed">
                Click any demo photo to trigger our **AI vision analyzer**. Gemini will classify the hazard, severity, and draft safety warnings in 1 second.
              </p>

              {isAnalyzing ? (
                <div className="bg-zinc-950 border border-brand-gold/20 rounded-2xl p-6 text-center flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-brand-gold animate-spin" />
                  <div className="text-xs font-black uppercase tracking-wider text-brand-gold">Gemini analyzing hazard photo...</div>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">Reading pavement distress indices and calculating community risk grades.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoPhotoSelect('pothole')}
                    className="flex flex-col items-center p-3 bg-zinc-950 hover:bg-zinc-900 border border-white/5 hover:border-brand-gold/30 rounded-xl text-center group transition-all"
                  >
                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🕳️</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Pothole</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoPhotoSelect('flood')}
                    className="flex flex-col items-center p-3 bg-zinc-950 hover:bg-zinc-900 border border-white/5 hover:border-brand-gold/30 rounded-xl text-center group transition-all"
                  >
                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🌊</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Flood</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoPhotoSelect('construction')}
                    className="flex flex-col items-center p-3 bg-zinc-950 hover:bg-zinc-900 border border-white/5 hover:border-brand-gold/30 rounded-xl text-center group transition-all"
                  >
                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🚧</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Works</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Vision Analysis Detail Panel */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            {aiAnalysisResult && (
              <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-2xl p-5 space-y-4 relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold font-mono text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  AI Vision Verified
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-3xl">{HAZARD_CONFIG[hazardType]?.emoji}</span>
                  <div>
                    <div className="text-[9px] font-black text-brand-gold font-mono tracking-wider uppercase">Hazard Detected</div>
                    <div className="text-sm font-black text-slate-100">{HAZARD_CONFIG[hazardType]?.label}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-3.5">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Confidence</span>
                    <div className="text-sm font-mono font-black text-brand-gold mt-0.5">{(aiAnalysisResult.confidence * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Severity</span>
                    <div className="text-sm font-bold text-orange-400 capitalize mt-0.5">{severity}</div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3.5">
                  <span className="text-[10px] font-black text-brand-red uppercase flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                    AI Safety Warning
                  </span>
                  <p className="text-xs text-slate-200 italic leading-relaxed">
                    "{aiAnalysisResult.safetyWarning}"
                  </p>
                </div>
              </div>
            )}

            <div className="bg-zinc-950 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-300">Have a custom photograph?</span>
                <p className="text-[10px] text-slate-500 mt-0.5">Upload a live photo to override preset evaluations.</p>
              </div>
              <label className="bg-zinc-800 hover:bg-zinc-700 text-slate-200 cursor-pointer text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/5 flex items-center gap-1.5 transition-all">
                <Camera className="w-4 h-4" />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomPhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* STEP 3: Category Refining & Summary Description */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            {/* Choose category manually */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Refine Hazard Category</label>
              <div className="grid grid-cols-3 gap-1.5">
                {Object.entries(HAZARD_CONFIG).map(([type, config]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setHazardType(type as HazardType)}
                    className={`p-2.5 rounded-xl text-center border transition-all flex flex-col items-center justify-center ${
                      hazardType === type
                        ? 'border-brand-gold bg-brand-gold/10 text-white font-bold'
                        : 'border-white/5 bg-zinc-950 text-slate-400 hover:bg-zinc-900'
                    }`}
                  >
                    <span className="text-lg mb-0.5">{config.emoji}</span>
                    <span className="text-[8px] font-black uppercase tracking-wider truncate w-full">{config.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Severity rating */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Severity Warning Level</label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(SEVERITY_CONFIG).map(([level, config]) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSeverity(level as SeverityLevel)}
                    className={`py-2 rounded-xl text-center border text-[10px] font-black uppercase tracking-wider transition-all ${
                      severity === level
                        ? 'border-white/10 shadow-lg text-white font-black'
                        : 'border-transparent bg-zinc-950 text-slate-500'
                    }`}
                    style={{ backgroundColor: severity === level ? config.color + '20' : undefined, borderColor: severity === level ? config.color : undefined }}
                  >
                    {config.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Description and enhance button */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Commute Advisory Remarks</label>
                <button
                  type="button"
                  onClick={handleEnhanceDescription}
                  disabled={isEnhancingDesc || !description || description.length < 5}
                  className="text-[10px] text-brand-gold font-bold hover:text-amber-300 flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  {isEnhancingDesc ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Cpu className="w-3.5 h-3.5" />
                  )}
                  Gemini AI Enhance
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe potholes count, water pooling depth, or lane blockages to warn other road users..."
                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-brand-gold h-24 resize-none"
                required
              />
            </div>

            {/* Blocking traffic toggle */}
            <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-xl border border-white/5">
              <div>
                <span className="text-xs font-bold text-slate-200">Is this blocking traffic?</span>
                <p className="text-[10px] text-slate-500 mt-0.5">Alert trotro riders and responders if lane is blocked.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBlockingTraffic}
                  onChange={(e) => setIsBlockingTraffic(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold peer-checked:after:bg-slate-950"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Button Controls Footer */}
      <div className="flex items-center gap-3 border-t border-white/5 pt-5 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-black uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer"
        >
          Cancel
        </button>

        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((prev) => (prev - 1) as any)}
            className="p-3.5 bg-zinc-800 hover:bg-zinc-700 text-slate-300 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={() => {
              if (step === 1 && !locationName) {
                alert('Please enter a location spot name or select coords first.');
                return;
              }
              setStep((prev) => (prev + 1) as any);
            }}
            className="flex-1 bg-brand-gold hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-brand-gold/10 active:scale-95 transition-all cursor-pointer"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 bg-brand-gold hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-brand-gold/10 active:scale-95 transition-all cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            Submit Advisory
          </button>
        )}
      </div>
    </div>
  );
}
