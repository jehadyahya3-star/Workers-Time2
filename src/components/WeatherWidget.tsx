import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Sun, 
  Wind, 
  Droplets, 
  RefreshCw, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  HardHat,
  Sparkles,
  MapPin,
  Navigation,
  Globe
} from 'lucide-react';

interface Citation {
  title: string;
  uri: string;
}

interface WeatherData {
  location: string;
  temperature: string;
  condition: string;
  humidity: string;
  windSpeed: string;
  summary?: string;
  recommendations: string[];
  searchCitations?: Citation[];
  isFallback?: boolean;
}

interface WeatherWidgetProps {
  projectLocation: string;
  projectName?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  projectLocation,
  projectName
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [customLocationInput, setCustomLocationInput] = useState<string>('');
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);

  const fetchWeather = async (locationStr: string, coords?: { lat: number; lng: number }) => {
    setLoading(true);
    setError(null);
    try {
      let queryUrl = `/api/weather?location=${encodeURIComponent(locationStr)}`;
      if (coords) {
        queryUrl += `&lat=${coords.lat}&lng=${coords.lng}`;
      }
      const res = await fetch(queryUrl);
      if (!res.ok) throw new Error('فشل جلب بيانات الطقس');
      const data = await res.json();
      setWeather(data);
    } catch (err: any) {
      console.error('Failed to load weather data:', err);
      setError('تعذر الاتصال بخدمة الطقس الحية');
    } finally {
      setLoading(false);
    }
  };

  // Get user's current GPS location via Google / Browser Geolocation API
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('متصفحك لا يدعم تحديد الموقع الجغرافي (Geolocation)');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setGpsCoords({ lat, lng });
        setIsGpsActive(true);
        const locLabel = `موقعي المباشر (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
        fetchWeather(locLabel, { lat, lng });
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLoading(false);
        let errMsg = 'تعذر تحديد موقعك الحالي عبر GPS. يرجى التأكد من تفعيل إذن الوصول للموقع.';
        if (err.code === err.PERMISSION_DENIED) {
          errMsg = 'تم رفض الإذن للوصول إلى موقعك الجغرافي. يمكنك السماح بالوصول من إعدادات المتصفح.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errMsg = 'معلومات الموقع الجغرافي غير متوفرة حالياً.';
        } else if (err.code === err.TIMEOUT) {
          errMsg = 'انتهت مهلة البحث عن موقعك الجغرافي.';
        }
        setError(errMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleResetToProjectLocation = () => {
    setIsGpsActive(false);
    setGpsCoords(null);
    fetchWeather(projectLocation || 'الرياض');
  };

  const handleSearchCustomLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLocationInput.trim()) return;
    setIsGpsActive(false);
    setGpsCoords(null);
    fetchWeather(customLocationInput.trim());
    setShowSearchInput(false);
  };

  useEffect(() => {
    if (!isGpsActive && projectLocation) {
      fetchWeather(projectLocation);
    }
  }, [projectLocation]);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950/40 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-700/80 space-y-4 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-700/80 pb-3 gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="bg-amber-500/20 p-2 rounded-xl text-amber-400 border border-amber-500/30">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                طقس موقع المشروع والتوصيات الميدانية
              </h3>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Google Search Grounding</span>
              </span>
              {isGpsActive && (
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>موقعك المباشر GPS</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>الموقع المعروض:</span>
              <strong className="text-amber-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400 inline" />
                {isGpsActive && gpsCoords
                  ? `موقعك الحرفي (${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lng.toFixed(4)})`
                  : projectLocation || 'غير محدد'}
              </strong>
              {isGpsActive && (
                <button
                  onClick={handleResetToProjectLocation}
                  className="text-[10px] text-slate-400 hover:text-amber-300 underline font-semibold transition-colors mr-2 cursor-pointer"
                >
                  (العودة لموقع المشروع)
                </button>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls: GPS Detection, Refresh, Manual Search */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {/* GPS Location Button */}
          <button
            onClick={handleDetectLocation}
            disabled={loading}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
              isGpsActive
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
            } disabled:opacity-50`}
            title="تحديد موقعي المباشر الآن عبر Google GPS"
          >
            <Navigation className={`w-3.5 h-3.5 ${isGpsActive ? 'animate-bounce' : ''}`} />
            <span>{isGpsActive ? 'موقعي المباشر (مفعل)' : 'تحديد موقعي (GPS)'}</span>
          </button>

          {/* Search location button */}
          <button
            onClick={() => setShowSearchInput(!showSearchInput)}
            className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer text-xs"
            title="بحث عن مدينة أو موقع آخر"
          >
            <Globe className="w-3.5 h-3.5" />
          </button>

          {/* Refresh button */}
          <button
            onClick={() => {
              if (isGpsActive && gpsCoords) {
                fetchWeather(`موقعي المباشر (${gpsCoords.lat.toFixed(3)}, ${gpsCoords.lng.toFixed(3)})`, gpsCoords);
              } else {
                fetchWeather(projectLocation || 'الرياض');
              }
            }}
            disabled={loading}
            className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 text-xs"
            title="تحديث بيانات الطقس"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline font-bold">تحديث</span>
          </button>
        </div>
      </div>

      {/* Manual Search Input Form */}
      {showSearchInput && (
        <form onSubmit={handleSearchCustomLocation} className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-700 relative z-10">
          <Search className="w-4 h-4 text-amber-400 mr-1 flex-shrink-0" />
          <input
            type="text"
            value={customLocationInput}
            onChange={(e) => setCustomLocationInput(e.target.value)}
            placeholder="ادخل اسم المدينة أو المنطقة (مثلاً: جدة، باجل، حي النرجس)..."
            className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none w-full"
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            بحث
          </button>
        </form>
      )}

      {/* Main Body */}
      {loading ? (
        <div className="py-6 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
          <p className="font-bold">
            {isGpsActive
              ? 'جاري البحث عن طقس موقعك الجغرافي المباشر عبر Google Search...'
              : 'جاري البحث المباشر عن طقس موقع المشروع وتحليل ظروف التشغيل...'}
          </p>
        </div>
      ) : error ? (
        <div className="py-4 bg-rose-950/40 border border-rose-800/50 rounded-xl p-3 text-rose-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={handleResetToProjectLocation}
            className="text-[11px] bg-rose-900/60 hover:bg-rose-800 text-rose-100 font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            العودة لموقع المشروع
          </button>
        </div>
      ) : weather ? (
        <div className="space-y-4 relative z-10">
          
          {/* Weather Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="sm:col-span-2 flex items-center gap-3">
              <div className="bg-amber-500/20 text-amber-400 p-3 rounded-xl border border-amber-500/30">
                <Sun className="w-7 h-7" />
              </div>
              <div>
                <div className="text-2xl font-black text-amber-400 flex items-baseline gap-1">
                  <span>{weather.temperature}</span>
                  <span className="text-xs font-bold text-slate-300">{weather.condition}</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">{weather.summary || weather.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 border-t sm:border-t-0 sm:border-r border-slate-800 pt-2 sm:pt-0 sm:pr-3">
              <Droplets className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-normal">نسبة الرطوبة:</span>
                <span>{weather.humidity}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 border-t sm:border-t-0 sm:border-r border-slate-800 pt-2 sm:pt-0 sm:pr-3">
              <Wind className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-normal">سرعة الرياح:</span>
                <span>{weather.windSpeed}</span>
              </div>
            </div>
          </div>

          {/* Recommendations for Site Engineers & Heavy Equipment */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
              <HardHat className="w-4 h-4 text-amber-400" />
              <span>توصيات تشغيلية وتوجيهات السلامة للمعدات الثقيلة والموقع:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {weather.recommendations?.map((rec, idx) => (
                <div key={idx} className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/70 text-xs font-semibold text-slate-200 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Search Citations Grounding Footer */}
          {weather.searchCitations && weather.searchCitations.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-bold text-slate-300">
                <Search className="w-3 h-3 text-amber-400" />
                <span>مصادر الطقس المعتمدة من نتائج Google الحية:</span>
              </span>
              {weather.searchCitations.slice(0, 3).map((cit, i) => (
                <a
                  key={i}
                  href={cit.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1 text-[10px] transition-colors"
                >
                  <span className="truncate max-w-[150px]">{cit.title}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ))}
            </div>
          )}

        </div>
      ) : null}

    </div>
  );
};

