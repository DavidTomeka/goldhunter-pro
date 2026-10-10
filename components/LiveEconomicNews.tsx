import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { EconomicNewsEvent, CityTimeZone } from '../types';
import { 
  MAJOR_WORLD_CITIES, 
  getDefaultUserCity, 
  generateLiveEconomicNews, 
  formatInCityTime, 
  getCountdownDetails 
} from '../services/newsService';
import { 
  Globe, 
  Clock, 
  Flame, 
  AlertTriangle, 
  ShieldAlert, 
  Search, 
  Filter, 
  Bell, 
  BellOff, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Volume2,
  VolumeX
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  onSimulatePriceShock?: (pips: number, reason: string) => void;
}

export const LiveEconomicNews: React.FC<Props> = ({ onSimulatePriceShock }) => {
  // User Selected Time Zone / City
  const [selectedCity, setSelectedCity] = useState<CityTimeZone>(() => {
    try {
      const saved = localStorage.getItem('xauusd_selected_city');
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = MAJOR_WORLD_CITIES.find(c => c.id === parsed.id || c.city === parsed.city);
        if (match) return match;
      }
    } catch (e) {
      // ignore
    }
    return getDefaultUserCity();
  });

  // Live Clock Tick
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [events, setEvents] = useState<EconomicNewsEvent[]>(() => generateLiveEconomicNews());
  const [expandedEventId, setExpandedEventId] = useState<string | null>('news_cpi_core');
  
  // Filters & Search
  const [impactFilter, setImpactFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [currencyFilter, setCurrencyFilter] = useState<'ALL' | 'USD' | 'EUR' | 'GBP'>('USD');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState<boolean>(false);
  const [citySearch, setCitySearch] = useState<string>('');

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save selected city
  const handleSelectCity = useCallback((city: CityTimeZone) => {
    setSelectedCity(city);
    setIsCityDropdownOpen(false);
    try {
      localStorage.setItem('xauusd_selected_city', JSON.stringify(city));
    } catch (e) {
      // ignore
    }
  }, []);

  // Filtered Cities for Search
  const filteredCities = useMemo(() => {
    if (!citySearch) {
      if (regionFilter === 'ALL') return MAJOR_WORLD_CITIES;
      return MAJOR_WORLD_CITIES.filter(c => c.region === regionFilter);
    }
    const q = citySearch.toLowerCase();
    return MAJOR_WORLD_CITIES.filter(c => 
      c.city.toLowerCase().includes(q) || 
      c.country.toLowerCase().includes(q) || 
      c.region.toLowerCase().includes(q) ||
      c.financialHub?.toLowerCase().includes(q)
    );
  }, [citySearch, regionFilter]);

  // Current City Live Time String
  const cityCurrentTime = useMemo(() => {
    return formatInCityTime(currentTime, selectedCity.iana);
  }, [currentTime, selectedCity.iana]);

  // Universal GMT Time String
  const gmtCurrentTime = useMemo(() => {
    return formatInCityTime(currentTime, 'UTC');
  }, [currentTime]);

  // Filtered Economic Events
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      if (impactFilter === 'HIGH' && ev.impact !== 'HIGH') return false;
      if (impactFilter === 'MEDIUM' && ev.impact === 'LOW') return false;
      if (currencyFilter !== 'ALL' && ev.currency !== currencyFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ev.title.toLowerCase().includes(q);
        const matchesCurrency = ev.currency.toLowerCase().includes(q);
        const matchesImpact = ev.goldImpact.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCurrency && !matchesImpact) return false;
      }
      return true;
    });
  }, [events, impactFilter, currencyFilter, searchQuery]);

  // Next Upcoming High Impact Event
  const nextHighImpactEvent = useMemo(() => {
    const futureHighImpact = events
      .filter(ev => ev.impact === 'HIGH' && ev.timestamp > currentTime - 5 * 60000)
      .sort((a, b) => a.timestamp - b.timestamp);
    return futureHighImpact[0] || events[0];
  }, [events, currentTime]);

  const nextEventCountdown = useMemo(() => {
    if (!nextHighImpactEvent) return null;
    return getCountdownDetails(nextHighImpactEvent.timestamp, currentTime);
  }, [nextHighImpactEvent, currentTime]);

  // Quick Switcher Cities
  const QUICK_CITIES = [
    { id: 'nyc', name: 'New York', flag: '🇺🇸' },
    { id: 'lon', name: 'London', flag: '🇬🇧' },
    { id: 'dxb', name: 'Dubai', flag: '🇦🇪' },
    { id: 'fra', name: 'Frankfurt', flag: '🇩🇪' },
    { id: 'sin', name: 'Singapore', flag: '🇸🇬' },
    { id: 'tyo', name: 'Tokyo', flag: '🇯🇵' },
    { id: 'jnb', name: 'Johannesburg', flag: '🇿🇦' },
    { id: 'syd', name: 'Sydney', flag: '🇦🇺' }
  ];

  // Simulate Actual Data Release
  const handleSimulateActual = useCallback((eventId: string) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId) return ev;
      // Generate surprise actual
      const actualVal = ev.title.includes('CPI') ? '0.4% (HOT)' : ev.title.includes('NFP') ? '214K (SURPRISE)' : '0.5%';
      return {
        ...ev,
        actual: actualVal,
        timestamp: Date.now() - 30000 // Just dropped 30 seconds ago
      };
    }));

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });

    if (onSimulatePriceShock) {
      onSimulatePriceShock(-18.5, 'Hot US CPI release triggers 185 pip gold liquidation into H1 Demand');
    }
  }, [onSimulatePriceShock]);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-6">
      {/* Top Header & Global Timezone Controller */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-md">
            <Flame className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                Live Macroeconomic News & High-Impact Events
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                RED FOLDER FEED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live news drop schedule with multi-city timezone auto-conversion and institutional S&D blackout safeguards
            </p>
          </div>
        </div>

        {/* Selected City & Live Clocks Display */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Active City Card */}
          <div className="px-3.5 py-1.5 bg-slate-950 rounded-xl border border-amber-500/30 flex items-center gap-2.5 shadow-md">
            <span className="text-lg">{selectedCity.flag}</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white font-sans">{selectedCity.city}</span>
                <span className="text-[9px] font-mono font-bold text-amber-400 px-1 py-0.2 bg-amber-500/10 rounded">
                  {selectedCity.utcOffset}
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs text-emerald-400 font-bold">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>{cityCurrentTime.timeStr}</span>
                <span className="text-[9px] text-slate-500">({cityCurrentTime.shortTz})</span>
              </div>
            </div>
          </div>

          {/* Universal GMT Reference */}
          <div className="px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-right">
            <span className="text-[9px] font-mono text-slate-500 block uppercase">Universal GMT / UTC</span>
            <span className="text-xs font-mono font-bold text-slate-300">{gmtCurrentTime.timeStr}</span>
          </div>

          {/* Timezone Configurator Button */}
          <div className="relative">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/10 active:scale-95"
            >
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Configure City Timezone</span>
              <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
            </button>

            {/* Dropdown Menu for all major world cities */}
            {isCityDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Select Major World City
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const detected = getDefaultUserCity();
                      handleSelectCity(detected);
                    }}
                    className="text-[10px] text-cyan-400 hover:underline font-mono"
                  >
                    Auto-Detect My Timezone
                  </button>
                </div>

                {/* City Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="Search city, country, or exchange..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
                    autoFocus
                  />
                </div>

                {/* Continental Region Tabs */}
                {!citySearch && (
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-mono">
                    {['ALL', 'Americas', 'Europe', 'Middle East', 'Africa', 'Asia', 'Pacific'].map(reg => (
                      <button
                        key={reg}
                        onClick={() => setRegionFilter(reg)}
                        className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
                          regionFilter === reg ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-slate-900'
                        }`}
                      >
                        {reg}
                      </button>
                    ))}
                  </div>
                )}

                {/* Scrollable Cities List */}
                <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredCities.map(city => {
                    const isSelected = selectedCity.id === city.id;
                    const previewTime = formatInCityTime(currentTime, city.iana);

                    return (
                      <button
                        key={city.id}
                        onClick={() => handleSelectCity(city)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                          isSelected 
                            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' 
                            : 'hover:bg-slate-900 text-slate-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{city.flag}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">{city.city}</span>
                              <span className="text-[10px] text-slate-400">({city.country})</span>
                            </div>
                            {city.financialHub && (
                              <span className="text-[9px] text-slate-500 font-mono block">
                                {city.financialHub}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <span className="text-xs font-bold text-emerald-400 block">
                            {previewTime.timeStr}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {city.utcOffset}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick City Switcher Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-slate-500" />
          Quick Switch:
        </span>
        <div className="flex items-center gap-1.5">
          {QUICK_CITIES.map(qc => {
            const isMatch = selectedCity.city === qc.name;
            return (
              <button
                key={qc.id}
                onClick={() => {
                  const target = MAJOR_WORLD_CITIES.find(c => c.city === qc.name);
                  if (target) handleSelectCity(target);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border shrink-0 ${
                  isMatch
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                <span>{qc.flag}</span>
                <span>{qc.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* IMMINENT NEWS DROP ALERT & BLACKOUT PROTOCOL BANNER */}
      {nextHighImpactEvent && nextEventCountdown && (
        <div className={`p-4 rounded-xl border relative overflow-hidden transition-all ${
          nextEventCountdown.isBlackout
            ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/50'
            : 'bg-slate-950 border-amber-500/30'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-rose-500 text-white rounded text-[10px] font-black tracking-wide flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-current" />
                  NEXT HIGH-IMPACT RELEASE
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {nextHighImpactEvent.currency} • {nextHighImpactEvent.dateLabel}
                </span>
              </div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                {nextHighImpactEvent.title}
              </h4>
              <p className="text-xs text-slate-300 leading-snug">
                {nextHighImpactEvent.goldImpact}
              </p>
            </div>

            {/* Live Countdown & Drop Time */}
            <div className="flex items-center gap-4 shrink-0 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">
                  Drops at ({selectedCity.city} Time)
                </span>
                <span className="text-sm font-black font-mono text-white">
                  {formatInCityTime(nextHighImpactEvent.timestamp, selectedCity.iana).timeStr}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block">
                  {formatInCityTime(nextHighImpactEvent.timestamp, 'UTC').timeStr} GMT
                </span>
              </div>

              <div className="h-10 w-px bg-slate-800" />

              <div className="text-center min-w-[130px]">
                <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                  Countdown
                </span>
                <span className={`text-base font-mono font-black ${
                  nextEventCountdown.isBlackout ? 'text-rose-400 animate-pulse' : 'text-amber-400'
                }`}>
                  {nextEventCountdown.text}
                </span>
                <span className="text-[9px] font-mono text-emerald-400 block font-bold">
                  ±{nextHighImpactEvent.expectedVolatilityPips} Pips Expected
                </span>
              </div>
            </div>
          </div>

          {/* Institutional Blackout Warning notice */}
          {nextEventCountdown.isBlackout && (
            <div className="mt-3 pt-2.5 border-t border-rose-500/30 flex items-center justify-between text-xs font-bold text-rose-300 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 animate-bounce" />
                <span>
                  INSTITUTIONAL BLACKOUT PERIOD ACTIVE: Do not enter unmitigated 4/4 zones right now. Wait for post-spike basing!
                </span>
              </div>
              <button
                onClick={() => handleSimulateActual(nextHighImpactEvent.id)}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-black transition-all active:scale-95 shadow"
              >
                Simulate News Drop Spike (±185p)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filters & Search Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Impact Filter */}
          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-bold">
            {(['ALL', 'HIGH', 'MEDIUM'] as const).map(imp => (
              <button
                key={imp}
                onClick={() => setImpactFilter(imp)}
                className={`px-2.5 py-1 rounded transition-all ${
                  impactFilter === imp 
                    ? imp === 'HIGH' ? 'bg-rose-950 text-rose-300 border border-rose-500/30 font-black' 
                    : 'bg-slate-800 text-amber-400 font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {imp === 'ALL' ? 'All Impacts' : imp === 'HIGH' ? 'High Only (Red Folder)' : 'Medium & High'}
              </button>
            ))}
          </div>

          {/* Currency Filter */}
          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
            {(['ALL', 'USD', 'EUR', 'GBP'] as const).map(curr => (
              <button
                key={curr}
                onClick={() => setCurrencyFilter(curr)}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  currencyFilter === curr 
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {curr === 'USD' ? 'USD (Gold)' : curr}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar & Sound Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search CPI, NFP, Fed..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            onClick={() => setSoundAlerts(!soundAlerts)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              soundAlerts 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={soundAlerts ? 'News Chime Alerts Enabled' : 'News Chime Alerts Muted'}
          >
            {soundAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ECONOMIC NEWS EVENTS TABLE */}
      <div className="space-y-2">
        {filteredEvents.map(event => {
          const isExpanded = expandedEventId === event.id;
          const dropTimeCity = formatInCityTime(event.timestamp, selectedCity.iana);
          const dropTimeGmt = formatInCityTime(event.timestamp, 'UTC');
          const countdown = getCountdownDetails(event.timestamp, currentTime);

          const isHigh = event.impact === 'HIGH';
          const isMed = event.impact === 'MEDIUM';

          return (
            <div
              key={event.id}
              className={`bg-slate-950/80 rounded-xl border transition-all overflow-hidden ${
                countdown.isBlackout
                  ? 'border-rose-500/60 bg-rose-950/20'
                  : isExpanded
                  ? 'border-amber-500/40 shadow-lg'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Event Header Row */}
              <div 
                onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/40 select-none"
              >
                {/* Time & Currency Info */}
                <div className="flex items-center gap-3">
                  {/* Impact Folder Icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isHigh 
                      ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400' 
                      : isMed
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isHigh ? <Flame className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>

                  {/* Drop Time in Selected City Timezone */}
                  <div className="min-w-[110px]">
                    <div className="flex items-center gap-1 font-mono text-xs font-black text-white">
                      <span>{dropTimeCity.timeStr.substring(0, 5)}</span>
                      <span className="text-[10px] text-amber-400 font-bold">{selectedCity.city}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 block">
                      {dropTimeGmt.timeStr.substring(0, 5)} GMT ({event.dateLabel})
                    </span>
                  </div>

                  {/* Currency Tag */}
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                    {event.currency}
                  </span>

                  {/* Title */}
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-white hover:text-amber-300 transition-colors">
                      {event.title}
                    </h5>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Expected Range: ±{event.expectedVolatilityPips} pips
                    </span>
                  </div>
                </div>

                {/* Right Metrics: Countdown, Forecast, Actual */}
                <div className="flex items-center gap-4 justify-between md:justify-end">
                  {/* Forecast vs Previous */}
                  <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 block">FORECAST</span>
                      <span className="text-slate-300 font-bold">{event.forecast}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 block">PREVIOUS</span>
                      <span className="text-slate-400">{event.previous}</span>
                    </div>
                    {event.actual ? (
                      <div className="text-right bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        <span className="text-[9px] text-emerald-400 block font-bold">ACTUAL</span>
                        <span className="text-emerald-300 font-black">{event.actual}</span>
                      </div>
                    ) : (
                      <div className="text-right">
                        <span className="text-[9px] text-slate-600 block">ACTUAL</span>
                        <span className="text-slate-600">Pending</span>
                      </div>
                    )}
                  </div>

                  {/* Countdown Badge */}
                  <div className="text-right min-w-[100px]">
                    <span className={`text-xs font-mono font-bold px-2 py-1 rounded-lg border ${
                      countdown.isBlackout
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : countdown.isPast
                        ? 'bg-slate-900 text-slate-500 border-slate-800'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}>
                      {countdown.text}
                    </span>
                  </div>

                  {/* Expand Chevron */}
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Institutional Analysis Card */}
              {isExpanded && (
                <div className="p-4 bg-slate-900 border-t border-slate-800/80 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Gold Impact Breakdown */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Gold (XAU/USD) Catalyst Mechanics</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {event.goldImpact}
                      </p>
                    </div>

                    {/* 4/4 S&D Tactical Execution Rule */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                        <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Institutional S&D Execution Rule</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono">
                        {event.institutionalRule}
                      </p>
                    </div>
                  </div>

                  {/* Quick Simulation Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                    <span className="font-mono text-[11px]">
                      Timezone: <strong className="text-white">{selectedCity.city} ({selectedCity.utcOffset})</strong> • Universal: <strong>{dropTimeGmt.timeStr} UTC</strong>
                    </span>

                    {!event.actual && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSimulateActual(event.id);
                        }}
                        className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg font-bold text-xs transition-all active:scale-95"
                      >
                        Simulate Event Release
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info & Best Practices */}
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-slate-200">Rule of Engagement:</strong> Never enter market orders during Red Folder news spikes. Wait for the initial 5-minute candle to wick into a 4/4 zone and confirm basing before executing.
          </span>
        </div>
        <div className="text-[10px] font-mono text-emerald-400 shrink-0 font-bold">
          ✓ Real-Time Synchronization Active
        </div>
      </div>
    </div>
  );
};
