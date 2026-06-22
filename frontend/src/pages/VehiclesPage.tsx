import { useState, useEffect } from 'react';
import { Search, Heart, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '@/config';
import { useAuth } from '@/hooks/useAuth';

export default function VehiclesPage() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [carsData, setCarsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/vehicles`, {
      headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}
    })
    .then(res => res.json())
    .then(data => {
      setCarsData(data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [session]);

  const [likedCars, setLikedCars] = useState<string[]>(() => {
    const stored = localStorage.getItem('likedCars');
    return stored ? JSON.parse(stored) : [];
  });

  const toggleLike = (carId: string) => {
    setLikedCars(prev => {
      const updated = prev.includes(carId) 
        ? prev.filter(id => id !== carId) 
        : [...prev, carId];
      localStorage.setItem('likedCars', JSON.stringify(updated));
      return updated;
    });
  };

  const categories = ['All', ...Array.from(new Set(carsData.map(c => c.category)))];

  const filteredCars = carsData.filter(car => {
    const matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (car.tagline && car.tagline.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || car.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-24 font-sans text-slate-900 selection:bg-[#4C158D]/20 selection:text-[#4C158D]">
      
      {/* Header section (retained from old styling but without sticky Navbar as AppLayout provides it) */}
      <header className="bg-white border-b border-slate-200/60 pt-6 pb-6 px-4 sm:px-6 relative overflow-hidden z-10 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#4C158D]/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-extrabold text-2xl tracking-tight text-slate-900">Vehicle Marketplace</h1>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                <Heart size={18} className={likedCars.length > 0 ? "fill-red-500 text-red-500" : ""} />
              </button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4C158D] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search for your ideal car..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-semibold placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-[#4C158D]/20 focus:border-[#4C158D] transition-all shadow-inner"
              />
            </div>
            <button className="bg-[#4C158D] text-white p-3.5 rounded-2xl flex items-center justify-center hover:bg-[#3f2bc2] hover:shadow-lg hover:shadow-[#4C158D]/20 transition-all">
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 relative z-0">
        
        {/* Categories horizontal list */}
        <div className="flex gap-2.5 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black tracking-wider transition-all border whitespace-nowrap ${
                  isSelected 
                    ? 'bg-[#4C158D] text-white border-[#4C158D] shadow-md shadow-[#4C158D]/10' 
                    : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="text-center py-16">
            <p className="text-lg text-slate-400 font-bold">Loading vehicles...</p>
          </div>
        )}

        {!loading && filteredCars.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg text-slate-400 font-bold">No vehicles found matching "{searchQuery}"</p>
          </div>
        )}

        {/* 2-column mobile grid, scaling to 3/4 columns on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {!loading && filteredCars.map((car) => {
            const isLiked = likedCars.includes(car.id);
            
            return (
              <div 
                key={car.id}
                onClick={() => navigate('/vehicles/' + car.id)}
                className="bg-white rounded-[28px] border p-4 pb-5 flex flex-col justify-between cursor-pointer transition-all duration-300 relative border-slate-100 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 group"
              >
                {/* Catchy Hook Badge */}
                <div className="bg-gradient-to-r from-[#4C158D] to-purple-600 text-white rounded-xl px-2 py-1.5 mb-2 flex items-center justify-center shadow-sm shadow-[#4C158D]/20 w-full">
                  <span className="text-[10px] font-black uppercase tracking-wider">Own from just UGX 5,000</span>
                </div>

                {/* Car Image centered, slightly floating */}
                <div className="relative w-full h-24 sm:h-32 flex items-center justify-center mb-3">
                  <img 
                    src={car.image} 
                    alt={car.name} 
                    className="max-w-full max-h-full object-contain mix-blend-multiply drop-shadow-md transition-transform duration-300 group-hover:scale-105" 
                  />
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight tracking-tight">{car.name}</h3>
                  <p className="text-slate-400 font-bold text-[10px] mt-0.5 tracking-tight line-clamp-1">{car.tagline}</p>
                </div>

                {/* Price range details */}
                <div className="mt-3 pt-3 border-t border-slate-50 text-[11px] space-y-1 text-slate-500 font-semibold">
                  <div className="flex justify-between items-center">
                    <span>Used (Old):</span>
                    <span className="text-slate-800 font-bold">{car.oldPriceRange}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>New:</span>
                    <span className="text-slate-800 font-bold">{car.newPriceRange}</span>
                  </div>
                  <p className="text-[9px] text-amber-600 font-extrabold italic mt-1 leading-none">
                    Depending on the Condition
                  </p>
                </div>

                {/* Rating & Favorite Heart Toggle */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400 font-black text-sm">★</span>
                    <span className="text-xs font-black text-slate-700">{car.rating}</span>
                    <span className="text-slate-300 text-[10px]">|</span>
                    <span className="text-[11px] font-black text-[#4C158D]">{car.priceStr}</span>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(car.id);
                    }}
                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-red-50 flex items-center justify-center transition-colors hover-group"
                  >
                    <Heart 
                      size={14} 
                      className={`transition-colors ${
                        isLiked 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-slate-400 group-hover:text-red-500'
                      }`} 
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
